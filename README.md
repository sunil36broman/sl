# Real Estate REST API

Production-oriented Django 5 API for project inventory, publishing, careers, customer inquiries, meetings, landowner proposals, newsletters, and site content. Gunicorn is exposed directly on port 8000 in the streamlined Docker deployment.

## Run locally

Requires Python 3.12+ and PostgreSQL 16.

```bash
cp .env.example .env
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

For a complete local stack, set a strong `SECRET_KEY` in `.env`, then run `docker compose up --build`. Swagger is at `http://localhost:8000/api/docs/`, ReDoc at `http://localhost:8000/api/redoc/`, and the schema at `http://localhost:8000/api/schema/`.

Run tests with `pytest`; generate a coverage report with `pytest --cov=. --cov-report=html`. Load seed data with `python manage.py loaddata fixtures/initial_data.json` after replacing the empty starter fixture with organization-owned content.

Every `/api/` request is written to Gunicorn's access log and to the `AuditLog` table without request bodies or credentials. Follow container logs with `docker compose logs -f web`; inspect searchable audit history in Django Admin under **Audit logs**.

## Production checklist

- Terminate TLS at the load balancer/Nginx and enable `SECURE_SSL_REDIRECT`.
- Generate a high-entropy secret, restrict hosts/CORS, and use managed PostgreSQL.
- Configure a transactional email provider and an S3-compatible private upload bucket. Email is sent synchronously in this streamlined deployment.
- Add the selected CAPTCHA provider credentials to the public-form service.
- Run migrations as a one-off release job, not concurrently from every web replica.
- Export database backups daily and keep encrypted off-site copies. Test recovery quarterly. Example: `pg_dump --format=custom --file=backup.dump "$DATABASE_URL"`; restore into a clean database using `pg_restore --clean --if-exists --dbname="$RESTORE_DATABASE_URL" backup.dump`.
- Ship structured application/access logs to centralized storage and alert on health, 5xx rate, and database saturation.

Architecture, relationships, API catalogue, and rollout phases are in [docs/architecture.md](docs/architecture.md), [docs/erd.md](docs/erd.md), and [docs/api.md](docs/api.md).

# s
# raha-web
# s-test
# raha-web
