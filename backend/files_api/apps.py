from django.apps import AppConfig


class FilesApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "files_api"

    def ready(self):
        import files_api.signals
