from rest_framework import viewsets
from .models import Experience, Education, Project, Skill, Leadership, Publication
from .serializers import ExperienceSerializer, EducationSerializer
from .serializers import ProjectSerializer, SkillSerializer, LeadershipSerializer
from .serializers import PublicationSerializer
from django.db.models import F

class BaseCtxViewSet(viewsets.ReadOnlyModelViewSet):
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx['request'] = self.request
        return ctx

class ExperienceViewSet(BaseCtxViewSet):
    queryset = Experience.objects.prefetch_related('highlights','skills','photos').order_by('-start_date')
    serializer_class = ExperienceSerializer


class EducationViewSet(BaseCtxViewSet):
    queryset = (Education.objects
        .select_related('institution')
        .prefetch_related('photos')
        # Put NULL end_date first, then sort the rest by end_date descending
        .order_by(
            F('end_date').desc(nulls_first=True),  # ongoing first
            F('start_date').desc()
        )
    )
    serializer_class = EducationSerializer


class ProjectViewSet(BaseCtxViewSet):
    queryset = Project.objects.prefetch_related('photos').order_by('-start_date')
    serializer_class = ProjectSerializer

class SkillViewSet(BaseCtxViewSet):
    queryset = Skill.objects.order_by('name')
    serializer_class = SkillSerializer


class ExperienceViewSet(BaseCtxViewSet):
    queryset = (
        Experience.objects
        .select_related('organization')
        .prefetch_related('highlights','skills','photos')
        .order_by(
            F('end_date').desc(nulls_first=True),  # ongoing first
            F('start_date').desc())
    )
    serializer_class = ExperienceSerializer

class LeadershipViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Leadership.objects.select_related('target_content_type').prefetch_related('highlights','skills','photos').order_by('-start_date')
    serializer_class = LeadershipSerializer


class PublicationViewSet(BaseCtxViewSet):
    queryset = Publication.objects.select_related('target_content_type') \
        .prefetch_related('authors','skills','photos') \
        .order_by('-published_on', '-year', 'title')
    serializer_class = PublicationSerializer

