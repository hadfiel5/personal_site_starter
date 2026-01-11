
# backend/resume/views_preview.py
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from .models import ResumePreset

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

def resume_preview(request, slug=None):
    preset = _get_preset_or_404(slug)

    # Gather ordered items for template
    ctx = {
        "preset": preset,
        "experiences": [pe.experience for pe in preset.preset_experiences.select_related('experience')],
        "projects":    [pp.project for pp in preset.preset_projects.select_related('project')],
        "leadership":  [pl.leadership for pl in preset.preset_leadership.select_related('leadership')],
        "publications":[pu.publication for pu in preset.preset_publications.select_related('publication')],
        "request": request,  # for relative asset resolution
        # Preview flags
        "mode": request.GET.get("mode", "full"),
        "grid": request.GET.get("grid") == "on",
        "only": request.GET.get("section", "").strip().lower(),
    }

    html = render_to_string("resume_print_preview.html", ctx)
    return HttpResponse(mark_safe(html))
