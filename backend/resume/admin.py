
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.contrib.contenttypes.admin import GenericTabularInline
from django.contrib.contenttypes.models import ContentType

from .models import (
    Experience, Highlight, Skill, Education, Project, Institution,
    MediaAsset, Organization, Leadership, LeadershipHighlight, Publication, 
    PublicationAuthor, ResumePreset, ResumePresetExperience, ResumePresetProject,
    ResumePresetLeadership, ResumePresetPublication 
    )

class MediaAssetInline(GenericTabularInline):
    model = MediaAsset
    extra = 1

class HighlightInline(admin.TabularInline):
    model = Highlight
    extra = 1

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('display_name','website','logo_thumb')
    search_fields = ('long_name','short_name')

    def display_name(self, obj):
        return obj.short_name or obj.long_name

    def logo_thumb(self, obj):
        if obj.logo:
            return format_html('<img src="{}" style="height:24px;" />', obj.logo.url)
        return '—'
    logo_thumb.short_description = 'Logo'

TARGET_CHOICES = (('organization', 'Organization'), ('institution', 'Institution'))

class ExperienceAdminForm(forms.ModelForm):
    target_type = forms.ChoiceField(choices=TARGET_CHOICES, required=True)
    target_organization = forms.ModelChoiceField(queryset=Organization.objects.all(), required=False)
    target_institution = forms.ModelChoiceField(queryset=Institution.objects.all(), required=False)

    class Meta:
        model = Experience
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        inst = kwargs.get('instance')
        if inst and inst.target:
            if isinstance(inst.target, Organization):
                self.fields['target_type'].initial = 'organization'
                self.fields['target_organization'].initial = inst.target
            elif isinstance(inst.target, Institution):
                self.fields['target_type'].initial = 'institution'
                self.fields['target_institution'].initial = inst.target

    def clean(self):
        cleaned = super().clean()
        ttype = cleaned.get('target_type')
        org = cleaned.get('target_organization')
        inst = cleaned.get('target_institution')
        if ttype == 'organization' and not org:
            self.add_error('target_organization', 'Please select an organization.')
        elif ttype == 'institution' and not inst:
            self.add_error('target_institution', 'Please select an institution.')
        return cleaned

    def save(self, commit=True):
        instance: Experience = super().save(commit=False)
        ttype = self.cleaned_data.get('target_type')

        if ttype == 'organization':
            org = self.cleaned_data['target_organization']
            instance.target_content_type = ContentType.objects.get_for_model(Organization)
            instance.target_object_id = org.pk
        elif ttype == 'institution':
            inst = self.cleaned_data['target_institution']
            instance.target_content_type = ContentType.objects.get_for_model(Institution)
            instance.target_object_id = inst.pk

        if commit:
            instance.save()
            self.save_m2m()
        return instance


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    form = ExperienceAdminForm
    list_display = ('role', 'target_label', 'start_date', 'end_date', 'location')
    list_filter = ('start_date', 'end_date')
    search_fields = ('role', 'summary')
    ordering = ('-start_date',)  # DO NOT order by 'target'
    inlines = [HighlightInline, MediaAssetInline]
    filter_horizontal = ('skills',)

    fieldsets = (
        (None, {
            'fields': ('role', 'location', ('start_date', 'end_date'), 'summary', 'skills')
        }),
        ('Target (Organization or Institution)', {
            'fields': ('target_type', 'target_organization', 'target_institution'),
        }),
    )

    def target_label(self, obj):
        t = obj.target
        if not t:
            return '—'
        if getattr(t, 'short_name', None):
            return t.short_name
        return getattr(t, 'long_name', '—')
    target_label.short_description = 'Target'


@admin.register(Education)
class EducationAdmin(admin.ModelAdmin):
    list_display = ('degree_name','major','institution','start_date','end_date')
    list_filter = ('institution','start_date','end_date')
    search_fields = ('degree_name','major','minor')
    inlines = [MediaAssetInline]

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name','role','start_date','url')
    inlines = [MediaAssetInline]

admin.site.register(Skill)

@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = ('display_name','website')
    search_fields = ('long_name','short_name')
    def display_name(self, obj): return obj.short_name or obj.long_name

class LeadershipAdminForm(forms.ModelForm):
    these_choices = (('organization', 'Organization'), ('institution', 'Institution'), ('none', 'None'))
    target_type = forms.ChoiceField(choices=these_choices, required=False)
    target_organization = forms.ModelChoiceField(queryset=Organization.objects.all(), required=False)
    target_institution = forms.ModelChoiceField(queryset=Institution.objects.all(), required=False)

    class Meta:
        model = Leadership
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        inst = kwargs.get('instance')
        if inst and inst.target:
            if isinstance(inst.target, Organization):
                self.fields['target_type'].initial = 'organization'
                self.fields['target_organization'].initial = inst.target
            elif isinstance(inst.target, Institution):
                self.fields['target_type'].initial = 'institution'
                self.fields['target_institution'].initial = inst.target

    def clean(self):
        cleaned = super().clean()
        ttype = cleaned.get('target_type')
        org = cleaned.get('target_organization')
        inst = cleaned.get('target_institution')
        if ttype == 'organization' and not org:
            self.add_error('target_organization', 'Please select an organization.')
        elif ttype == 'institution' and not inst:
            self.add_error('target_institution', 'Please select an institution.')
        return cleaned

    def save(self, commit=True):
        instance: Leadership = super().save(commit=False)
        ttype = self.cleaned_data.get('target_type')
        if ttype == 'organization':
            org = self.cleaned_data.get('target_organization')
            if org:
                instance.target_content_type = ContentType.objects.get_for_model(Organization)
                instance.target_object_id = org.pk
        elif ttype == 'institution':
            inst = self.cleaned_data.get('target_institution')
            if inst:
                instance.target_content_type = ContentType.objects.get_for_model(Institution)
                instance.target_object_id = inst.pk
        if commit:
            instance.save()
            self.save_m2m()
        return instance

class MediaAssetInline(GenericTabularInline):
    model = MediaAsset
    extra = 1

class LeadershipHighlightInline(admin.TabularInline):
    model = LeadershipHighlight
    extra = 1

@admin.register(Leadership)
class LeadershipAdmin(admin.ModelAdmin):
    form = LeadershipAdminForm
    list_display = ('title','category','target_label','start_date','end_date','location')
    list_filter = ('category','start_date','end_date')
    search_fields = ('title','summary')
    ordering = ('-start_date',)
    inlines = [LeadershipHighlightInline, MediaAssetInline]
    filter_horizontal = ('skills',)

    fieldsets = (
        (None, {
            'fields': ('category','title','location',('start_date','end_date'),'summary','url','skills')
        }),
        ('Target (Organization or Institution)', {
            'fields': ('target_type','target_organization','target_institution')
        }),
    )

    def target_label(self, obj):
        t = obj.target
        if not t: return '—'
        if getattr(t,'short_name',None): return t.short_name
        return getattr(t,'long_name','—')
    target_label.short_description = 'Target'


class PublicationAdminForm(forms.ModelForm):
    target_type = forms.ChoiceField(choices=TARGET_CHOICES, required=False)
    target_organization = forms.ModelChoiceField(queryset=Organization.objects.all(), required=False)
    target_institution = forms.ModelChoiceField(queryset=Institution.objects.all(), required=False)

    class Meta:
        model = Publication
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        inst = kwargs.get('instance')
        if inst and inst.target:
            from .models import Organization, Institution
            if isinstance(inst.target, Organization):
                self.fields['target_type'].initial = 'organization'
                self.fields['target_organization'].initial = inst.target
            elif isinstance(inst.target, Institution):
                self.fields['target_type'].initial = 'institution'
                self.fields['target_institution'].initial = inst.target

    def clean(self):
        cleaned = super().clean()
        ttype = cleaned.get('target_type')
        org = cleaned.get('target_organization')
        inst = cleaned.get('target_institution')
        if ttype == 'organization' and not org:
            self.add_error('target_organization', 'Please select an organization.')
        elif ttype == 'institution' and not inst:
            self.add_error('target_institution', 'Please select an institution.')
        return cleaned

    def save(self, commit=True):
        instance: Publication = super().save(commit=False)
        ttype = self.cleaned_data.get('target_type')
        if ttype == 'organization':
            org = self.cleaned_data.get('target_organization')
            if org:
                instance.target_content_type = ContentType.objects.get_for_model(Organization)
                instance.target_object_id = org.pk
        elif ttype == 'institution':
            uni = self.cleaned_data.get('target_institution')
            if uni:
                instance.target_content_type = ContentType.objects.get_for_model(Institution)
                instance.target_object_id = uni.pk
        if commit:
            instance.save()
            self.save_m2m()
        return instance


class PublicationAuthorInline(admin.TabularInline):
    model = PublicationAuthor
    extra = 1

@admin.register(Publication)
class PublicationAdmin(admin.ModelAdmin):
    form = PublicationAdminForm
    list_display = ('title','kind','venue_label','year_or_date','target_label')
    list_filter = ('kind','year','published_on')
    search_fields = ('title','journal_or_venue','doi','abstract')
    ordering = ('-published_on','-year','title')
    inlines = [PublicationAuthorInline, MediaAssetInline]
    filter_horizontal = ('skills',)

    fieldsets = (
        (None, {
            'fields': ('kind','title','journal_or_venue','volume','issue','pages',
                       ('year','published_on'),'doi','url','abstract','skills')
        }),
        ('Target (Organization or Institution)', {
            'fields': ('target_type','target_organization','target_institution')
        }),
    )

    def venue_label(self, obj): return obj.journal_or_venue or '—'
    venue_label.short_description = 'Venue'
    def year_or_date(self, obj): return obj.published_on or obj.year or '—'
    year_or_date.short_description = 'Year/Date'

    def target_label(self, obj):
        t = obj.target
        if not t: return '—'
        if getattr(t,'short_name',None): return t.short_name
        return getattr(t,'long_name','—')
    target_label.short_description = 'Target'

class ResumePresetExperienceInline(admin.TabularInline):
    model = ResumePresetExperience
    extra = 1

class ResumePresetProjectInline(admin.TabularInline):
    model = ResumePresetProject
    extra = 1

class ResumePresetLeadershipInline(admin.TabularInline):
    model = ResumePresetLeadership
    extra = 1

class ResumePresetPublicationInline(admin.TabularInline):
    model = ResumePresetPublication
    extra = 1

@admin.register(ResumePreset)
class ResumePresetAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_default_public', 'updated_at')
    list_editable = ('is_default_public',)
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {"slug": ("name",)}
    inlines = [
        ResumePresetExperienceInline,
        ResumePresetProjectInline,
        ResumePresetLeadershipInline,
        ResumePresetPublicationInline
    ]

