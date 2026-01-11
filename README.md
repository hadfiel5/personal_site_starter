
# Personal Site Starter (Next.js + Django)

Minimalist, academic-friendly personal site with a Python backend and modern frontend.

## Quickstart

### 1) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed
python manage.py runserver 127.0.0.1:8000
```

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Then browse `http://127.0.0.1:3000` and open **Experience/Education/Projects**. Data is served from the Django API.

## Next steps
- Customize models, add more fields (publications, awards).
- Implement resume export (`/export/resume.pdf`) using WeasyPrint.
- Deploy frontend on Vercel, backend on Render/Fly, Postgres in production.

## Structure
```
personal_site_starter/
  backend/
    core/ ... Django project
    resume/ ... app with models/serializers/views
    templates/resume_print.html
    requirements.txt
  frontend/
    app/ ... Next.js App Router pages
    styles/globals.css
    tailwind.config.ts
    package.json
```
