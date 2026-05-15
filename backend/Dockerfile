FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1

WORKDIR /app

# Install build tools + MSSQL ODBC driver
RUN apt-get update && apt-get install -y --no-install-recommends \
        curl gnupg gcc unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list -o /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && rm -rf /var/lib/apt/lists/* \
    && python -m venv /venv

ENV PATH="/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    # Drop build-only tools after compilation — runtime only needs unixodbc + msodbcsql18
    && apt-get purge -y gcc unixodbc-dev \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*

COPY . .

RUN addgroup --system --gid 101 django \
    && adduser --system --uid 101 --ingroup django django \
    && chown -R django:django /app

USER django

EXPOSE 8000

CMD ["sh", "-c", \
     "python manage.py migrate --noinput && \
      python manage.py collectstatic --noinput && \
      gunicorn config.wsgi:application \
        --bind 0.0.0.0:8000 \
        --workers 2 \
        --threads 2 \
        --timeout 120 \
        --access-logfile -"]
