
# Backend (Django + DRF)

## Prereqs
- Python 3.10+
- pip

## Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations resume
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py seed              # sample data
python manage.py runserver 127.0.0.1:8000
```

API endpoints (read-only):
- `GET /api/experience/`
- `GET /api/education/`
- `GET /api/projects/`
- `GET /api/skills/`

Admin: `http://127.0.0.1:8000/admin/`
