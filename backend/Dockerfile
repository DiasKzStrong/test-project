FROM python:3.13-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc 

RUN pip install poetry

COPY pyproject.toml .

COPY poetry.lock .

RUN poetry config virtualenvs.create false && poetry install --no-root

COPY . .

WORKDIR /app/src
