
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey, GenericRelation
from django.contrib.contenttypes.models import ContentType
from django.utils.text import slugify

class BaseStamped(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        abstract = True

# --- New: Institution with long/short names & logo ---
class Institution(BaseStamped):
    long_name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=100, blank=True)
    logo = models.ImageField(upload_to='institutions/logos/', blank=True)
    website = models.URLField(blank=True)
    experiences = GenericRelation(
        'resume.Experience',
        content_type_field='target_content_type',
        object_id_field='target_object_id',
        related_query_name='inst_experiences'
    )
    leaderships = GenericRelation(
        'resume.Leadership', 
        content_type_field='target_content_type',
        object_id_field='target_object_id', 
        related_query_name='inst_leaderships'
    )
    publications = GenericRelation(
        'resume.Publication', 
        content_type_field='target_content_type',
        object_id_field='target_object_id', 
        related_query_name='inst_publications'
    )

    def __str__(self):
        return self.short_name or self.long_name

# --- New: Generic photo attachment usable by any model ---
class MediaAsset(BaseStamped):
    image = models.ImageField(upload_to='photos/')
    caption = models.CharField(max_length=200, blank=True)
    alt_text = models.CharField(max_length=200, blank=True)
    order = models.PositiveIntegerField(default=0)

    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return self.caption or f"Photo #{self.pk}"

class Skill(BaseStamped):
    name = models.CharField(max_length=100, unique=True)
    def __str__(self): return self.name

class Organization(BaseStamped):
    long_name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=100, blank=True)
    logo = models.ImageField(upload_to='organizations/logos/', blank=True)
    website = models.URLField(blank=True)
    experiences = GenericRelation(
        'resume.Experience',
        content_type_field='target_content_type',
        object_id_field='target_object_id',
        related_query_name='org_experiences'
    )
    leaderships = GenericRelation(
        'resume.Leadership', 
        content_type_field='target_content_type',
        object_id_field='target_object_id', 
        related_query_name='org_leaderships'
    )
    publications = GenericRelation(
        'resume.Publication', 
        content_type_field='target_content_type',
        object_id_field='target_object_id', 
        related_query_name='org_publications'
    )

    def __str__(self):
        return self.short_name or self.long_name

    
class Experience(BaseStamped):
    # organization = models.ForeignKey(
    #     Organization, null=False, on_delete=models.PROTECT, related_name='experiences'
    # )
    role = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    skills = models.ManyToManyField(Skill, related_name='experiences', blank=True)
    photos = GenericRelation(MediaAsset, related_query_name='experience')

    # Polymorphic link: points to either Institution or Organization
    target_content_type = models.ForeignKey(ContentType,on_delete=models.PROTECT)
    target_object_id = models.PositiveIntegerField()
    target = GenericForeignKey('target_content_type', 'target_object_id')

    def __str__(self):
        # Show a readable organization/institution label when available
        label = None
        if isinstance(self.target, Organization):
            label = self.target.short_name or self.target.long_name
        elif isinstance(self.target, Institution):
            label = self.target.short_name or self.target.long_name
        return f"{self.role} @ {label or '—'}"



class Highlight(BaseStamped):
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE, related_name='highlights')
    text = models.CharField(max_length=400)
    def __str__(self): return self.text[:50]

# --- Updated Education: degree vs major, optional minor; attach photos ---
class Education(BaseStamped):
    institution = models.ForeignKey(Institution, on_delete=models.PROTECT, related_name='educations')
    degree_name = models.CharField(max_length=200)  # e.g., "M.S.", "Ph.D."
    major = models.CharField(max_length=200, blank=True)  # e.g., "Data Science"
    minor = models.CharField(max_length=200, blank=True)  # optional
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    gpa = models.CharField(max_length=10, blank=True)
    photos = GenericRelation(MediaAsset, related_query_name='education')

    def __str__(self):
        base = f"{self.degree_name}"
        if self.major: base += f" in {self.major}"
        return f"{base} @ {self.institution}"

class Project(BaseStamped):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    url = models.URLField(blank=True)
    summary = models.TextField(blank=True)
    photos = GenericRelation(MediaAsset, related_query_name='project')
    def __str__(self): return self.name

# --- New: Leadership/Volunteer entries ---
class Leadership(BaseStamped):
    CATEGORY_CHOICES = (
        ('leadership', 'Leadership'),
        ('volunteer', 'Volunteer'),
    )
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='leadership')

    title = models.CharField(max_length=200)                       # e.g., "Chair", "Mentor", "Coordinator"
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    summary = models.TextField(blank=True)
    url = models.URLField(blank=True)

    # Polymorphic target (org or institution)
    target_content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT, null=True, blank=True)
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')

    skills = models.ManyToManyField(Skill, related_name='leaderships', blank=True)
    photos = GenericRelation(MediaAsset, related_query_name='leadership')

    def __str__(self):
        label = None
        if isinstance(self.target, Organization):
            label = self.target.short_name or self.target.long_name
        elif isinstance(self.target, Institution):
            label = self.target.short_name or self.target.long_name
        return f"{self.title} @ {label or '—'}"

class LeadershipHighlight(BaseStamped):
    leadership = models.ForeignKey(Leadership, on_delete=models.CASCADE, related_name='highlights')
    text = models.CharField(max_length=400)
    def __str__(self): return self.text[:50]


class Publication(BaseStamped):
    KIND_CHOICES = (
        ('journal', 'Journal Article'),
        ('conference', 'Conference Paper'),
        ('preprint', 'Preprint'),
        ('thesis', 'Thesis'),
        ('book', 'Book'),
        ('chapter', 'Book Chapter'),
        ('poster', 'Poster'),
        ('other', 'Other'),
    )

    kind = models.CharField(max_length=20, choices=KIND_CHOICES, default='journal')
    title = models.CharField(max_length=300)
    # You can store either year or an exact date; both are useful
    year = models.PositiveIntegerField(null=True, blank=True)
    published_on = models.DateField(null=True, blank=True)

    journal_or_venue = models.CharField(max_length=200, blank=True)
    volume = models.CharField(max_length=50, blank=True)
    issue = models.CharField(max_length=50, blank=True)
    pages = models.CharField(max_length=50, blank=True)

    doi = models.CharField(max_length=150, blank=True)  # e.g., "10.1234/xyz.2025.001"
    url = models.URLField(blank=True)
    abstract = models.TextField(blank=True)

    # Polymorphic target (org or institution)
    target_content_type = models.ForeignKey(ContentType, on_delete=models.PROTECT, null=True, blank=True)
    target_object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('target_content_type', 'target_object_id')

    skills = models.ManyToManyField(Skill, related_name='publications', blank=True)
    photos = GenericRelation(MediaAsset, related_query_name='publication')

    def __str__(self):
        return self.title

class PublicationAuthor(BaseStamped):
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE, related_name='authors')
    full_name = models.CharField(max_length=150)
    affiliation = models.CharField(max_length=200, blank=True)
    order = models.PositiveSmallIntegerField(default=1)
    corresponding = models.BooleanField(default=False)
    me = models.BooleanField(default=False)  # mark yourself

    class Meta:
        ordering = ['order']

    def __str__(self):
        flag = ' *' if self.corresponding else ''
        return f"{self.full_name}{flag}"


# NEW: Admin-uploadable template files (print or preview)
class TemplateFile(models.Model):
    KIND_CHOICES = [
        ("print", "Print (PDF)"),
        ("preview", "Preview (browser)"),
    ]

    name = models.CharField(max_length=120)              # Human label: “Dense v1”
    slug = models.SlugField(max_length=120, unique=True) # e.g., 'dense-v1'
    kind = models.CharField(max_length=20, choices=KIND_CHOICES)
    file = models.FileField(upload_to="templates/resume/")  # lives under MEDIA_ROOT/templates/resume/
    is_active = models.BooleanField(default=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.kind})"

class ResumePreset(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    is_default_public = models.BooleanField(default=False)  # only one should be True
    updated_at = models.DateTimeField(auto_now=True)

    # Optional: contact/profile fields that override defaults in export (later)
    header_title = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=50, blank=True)

    print_template_file   = models.ForeignKey(
        TemplateFile, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="presets_print",
        limit_choices_to={"kind": "print"}
    )  # NEW

    preview_template_file = models.ForeignKey(
        TemplateFile, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="presets_preview",
        limit_choices_to={"kind": "preview"}
    )  # NEW


    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        # enforce single default (simple approach)
        if self.is_default_public:
            ResumePreset.objects.exclude(pk=self.pk).update(is_default_public=False)
        super().save(*args, **kwargs)

    def __str__(self):
        label = " (public default)" if self.is_default_public else ""
        return f"{self.name}{label}"

class ResumePresetExperience(models.Model):
    preset = models.ForeignKey(ResumePreset, on_delete=models.CASCADE, related_name='preset_experiences')
    experience = models.ForeignKey(Experience, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('preset', 'experience')
        ordering = ['order']

class ResumePresetProject(models.Model):
    preset = models.ForeignKey(ResumePreset, on_delete=models.CASCADE, related_name='preset_projects')
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('preset', 'project')
        ordering = ['order']

class ResumePresetLeadership(models.Model):
    preset = models.ForeignKey(ResumePreset, on_delete=models.CASCADE, related_name='preset_leadership')
    leadership = models.ForeignKey(Leadership, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('preset', 'leadership')
        ordering = ['order']

class ResumePresetPublication(models.Model):
    preset = models.ForeignKey(ResumePreset, on_delete=models.CASCADE, related_name='preset_publications')
    publication = models.ForeignKey(Publication, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('preset', 'publication')
        ordering = ['order']

class ResumePresetEducation(models.Model):
    preset = models.ForeignKey(
        ResumePreset,
        on_delete=models.CASCADE,
        related_name='preset_educations'
    )
    education = models.ForeignKey(Education, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=1)


    class Meta:
        unique_together = ('preset', 'education')
        ordering = ['order']


