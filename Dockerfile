FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN addgroup --system django && adduser --system --ingroup django django \
    && mkdir -p /app/staticfiles \
    && chown django:django /app /app/staticfiles
COPY --chown=django:django . .
USER django
RUN python manage.py collectstatic --noinput

FROM base AS test
USER root
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt
USER django

FROM base AS runtime
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "60"]
