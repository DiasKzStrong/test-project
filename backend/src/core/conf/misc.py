from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/
# SECURITY WARNING: keep the secret key used in production secret!
BASE_DIR = Path(__file__).resolve().parent.parent

ROOT_URLCONF = "core.urls"

WSGI_APPLICATION = "core.wsgi.application"

# Disable built-in ./manage.py test command in favor of pytest
TEST_RUNNER = "core.test.disable_test_command_runner.DisableTestCommandRunner"

