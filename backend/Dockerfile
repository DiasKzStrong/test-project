FROM python:3.13-alpine

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml .

COPY poetry.lock .

RUN poetry install

COPY . .

CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]