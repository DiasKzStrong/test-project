import os
from django.core.management.commands.startapp import Command as StartAppCommand
from django.conf import settings


class Command(StartAppCommand):
    def handle(self, *args, **options):
        if not options.get("directory"):
            directory = settings.BASE_DIR / "apps" / options.get("name")
            directory.mkdir()
            options["directory"] = str(directory)
        super().handle(*args, **options)
        
