
from django.urls import path, include
from rest_framework import routers
from .views import ExperienceViewSet, EducationViewSet, ProjectViewSet, SkillViewSet, LeadershipViewSet, PublicationViewSet

router = routers.DefaultRouter()
router.register(r'experience', ExperienceViewSet)
router.register(r'education', EducationViewSet)
router.register(r'projects', ProjectViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'leadership', LeadershipViewSet)
router.register(r'publications', PublicationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
