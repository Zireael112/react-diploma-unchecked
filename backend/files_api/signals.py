from django.db.models.signals import post_delete
from django.dispatch import receiver
import os

from .models import UserFile


@receiver(post_delete, sender=UserFile)
def delete_user_storage_path(sender, instance, **kwargs):
    file_path = instance.file.path

    if os.path.exists(file_path):
        os.remove(file_path)
