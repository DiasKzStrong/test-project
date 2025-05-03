#!/bin/bash
set -e

cd /app

echo "Running linting checks..."

# Run ruff linter
echo "Running ruff..."
ruff check src/

# Run mypy type checking
echo "Running mypy..."
mypy src/ || echo "Mypy found issues, but continuing execution..."

# Wait for Postgres to be ready
echo "Waiting for Postgres..."
/app/scripts/wait-for-it.sh postgres:5432 --timeout=30 --strict -- echo "Postgres is up"

echo "Running migrations..."
cd src
python manage.py makemigrations
python manage.py migrate

bash /app/scripts/initial_data_db.sh

echo "Running tests..."
pytest

# Start Gunicorn server
echo "Starting Gunicorn server..."
exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --reload
