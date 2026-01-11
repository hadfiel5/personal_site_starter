
# backend/resume/views_export.py
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.conf import settings
from .models import ResumePreset
from weasyprint import HTML

def _get_preset_or_404(slug=None):
    if slug:
        try:
            return ResumePreset.objects.get(slug=slug)
        except ResumePreset.DoesNotExist:
            raise Http404("Resume preset not found")
    preset = ResumePreset.objects.filter(is_default_public=True).first()
    if not preset:
        raise Http404("No public default resume preset configured")
    return preset

def resume_pdf(request, slug=None):
    preset = _get_preset_or_404(slug)

    # Gather ordered items for template
    ctx = {
        "preset": preset,
        "experiences": [pe.experience for pe in preset.preset_experiences.select_related('experience')],
        "projects":    [pp.project for pp in preset.preset_projects.select_related('project')],
        "leadership":  [pl.leadership for pl in preset.preset_leadership.select_related('leadership')],
        "publications":[pu.publication for pu in preset.preset_publications.select_related('publication')],
        "request": request,  # for absolute URLs
    }

    html = render_to_string("resume_print.html", ctx)
    # base_url ensures CSS, images are resolvable by WeasyPrint
    pdf = HTML(string=html, base_url=request.build_absolute_uri('/')).write_pdf()
    resp = HttpResponse(pdf, content_type='application/pdf')
    filename = f"{preset.slug}_resume.pdf" if slug else "resume.pdf"
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    return resp
