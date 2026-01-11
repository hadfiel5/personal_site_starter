
from rest_framework import serializers
from .models import Publication, PublicationAuthor, Experience, Highlight, Skill
from .models import Education, Project, Institution, MediaAsset, Organization, Leadership, LeadershipHighlight

class MediaAssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaAsset
        fields = ['id', 'image', 'caption', 'alt_text', 'order']

class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'long_name', 'short_name', 'logo', 'website']

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name']

class HighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Highlight
        fields = ['id', 'text']

class ExperienceSerializer(serializers.ModelSerializer):
    highlights = HighlightSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    photos = MediaAssetSerializer(many=True, read_only=True)
    class Meta:
        model = Experience
        fields = [
            'id','organization','role','start_date','end_date',
            'location','summary','highlights','skills','photos'
        ]

class EducationSerializer(serializers.ModelSerializer):
    institution = InstitutionSerializer()
    photos = MediaAssetSerializer(many=True, read_only=True)
    class Meta:
        model = Education
        fields = [
            'id','institution','degree_name','major','minor',
            'start_date','end_date','gpa','photos'
        ]

class ProjectSerializer(serializers.ModelSerializer):
    photos = MediaAssetSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ['id','name','role','start_date','end_date','url','summary','photos']

class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['id','long_name','short_name','logo','website']

class ExperienceSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer()
    highlights = HighlightSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    photos = MediaAssetSerializer(many=True, read_only=True)
    class Meta:
        model = Experience
        fields = [
            'id','organization','role','start_date','end_date',
            'location','summary','highlights','skills','photos'
        ]

class MediaAssetSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = ['id','image','caption','alt_text','order']

    def get_image(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        # absolute URL
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id','name']

class LeadershipHighlightSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeadershipHighlight
        fields = ['id','text']

class LeadershipSerializer(serializers.ModelSerializer):
    highlights = LeadershipHighlightSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    photos = MediaAssetSerializer(many=True, read_only=True)
    target_ref = serializers.SerializerMethodField()

    class Meta:
        model = Leadership
        fields = [
            'id','category','title','start_date','end_date','location','summary','url',
            'target_ref','highlights','skills','photos'
        ]

    def get_target_ref(self, obj):
        request = self.context.get('request')
        t = obj.target
        if not t:
            return None
        def _abs(url):
            return request.build_absolute_uri(url) if (request and url) else url

        if isinstance(t, Organization):
            return {
                "type": "organization",
                "id": t.id,
                "short_name": t.short_name,
                "long_name": t.long_name,
                "logo": _abs(t.logo.url) if t.logo else None,
                "website": t.website,
            }
        if isinstance(t, Institution):
            return {
                "type": "institution",
                "id": t.id,
                "short_name": t.short_name,
                "long_name": t.long_name,
                "logo": _abs(t.logo.url) if t.logo else None,
                "website": t.website,
            }
        return None

class PublicationAuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationAuthor
        fields = ['id','full_name','affiliation','order','corresponding','me']

class PublicationSerializer(serializers.ModelSerializer):
    authors = PublicationAuthorSerializer(many=True, read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    photos = MediaAssetSerializer(many=True, read_only=True)
    target_ref = serializers.SerializerMethodField()
    doi_url = serializers.SerializerMethodField()

    class Meta:
        model = Publication
        fields = [
            'id','kind','title','year','published_on','journal_or_venue',
            'volume','issue','pages','doi','doi_url','url','abstract',
            'target_ref','authors','skills','photos'
        ]

    def get_target_ref(self, obj):
        request = self.context.get('request')
        t = obj.target
        if not t: return None
        def _abs(u): return request.build_absolute_uri(u) if (request and u) else u
        if isinstance(t, Organization):
            return {
                "type": "organization", "id": t.id,
                "short_name": t.short_name, "long_name": t.long_name,
                "logo": _abs(t.logo.url) if t.logo else None, "website": t.website,
            }
        if isinstance(t, Institution):
            return {
                "type": "institution", "id": t.id,
                "short_name": t.short_name, "long_name": t.long_name,
                "logo": _abs(t.logo.url) if t.logo else None, "website": t.website,
            }
        return None

    def get_doi_url(self, obj):
        if obj.doi:
            return f"https://doi.org/{obj.doi}"
        return None
