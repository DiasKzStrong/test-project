from decouple import config
import dj_database_url

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATABASES = {
    "default": dj_database_url.parse(
        config("DB_URL"),
        conn_max_age=600,
        conn_health_checks=True,
    )
}