
from django.core.management.base import BaseCommand
from datetime import date
from resume.models import Skill, Experience, Highlight, Education, Project

class Command(BaseCommand):
    help = 'Seed database with sample resume content'

    def handle(self, *args, **options):
        skills = ['Python','Django','REST APIs','Data Analysis','Collaboration','Tailwind','Next.js']
        skill_objs = {name: Skill.objects.get_or_create(name=name)[0] for name in skills}

        exp, _ = Experience.objects.get_or_create(
            organization='Example Lab',
            role='Collaborative Researcher',
            start_date=date(2023,6,1),
            location='Remote',
            summary='Led collaborative studies on X and built reproducible Python pipelines.'
        )
        exp.skills.set([skill_objs['Python'], skill_objs['Django'], skill_objs['Data Analysis'], skill_objs['Collaboration']])
        Highlight.objects.get_or_create(experience=exp, text='Published 2 peer-reviewed papers.')
        Highlight.objects.get_or_create(experience=exp, text='Built reproducible pipelines with Python.')

        edu, _ = Education.objects.get_or_create(
            institution='University of Somewhere',
            degree='M.S. Data Science',
            start_date=date(2021,9,1),
            end_date=date(2023,5,31)
        )

        proj, _ = Project.objects.get_or_create(
            name='OpenCollab Toolkit',
            role='Creator',
            start_date=date(2024,1,1),
            url='https://github.com/brandon/open-collab',
            summary='Toolkit for collaborative research workflows.'
        )

        self.stdout.write(self.style.SUCCESS('Seed data created.'))
