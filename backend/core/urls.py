
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from resume.views_export import resume_pdf
from resume.views_preview import resume_preview

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('resume.urls')),
    path('export/resume.pdf', resume_pdf),                # default public
    path('export/resume/<slug:slug>.pdf', resume_pdf),   # specific preset
    path('export/resume/preview', resume_preview),              # default preset
    path('export/resume/<slug:slug>/preview', resume_preview),  # specific preset

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



