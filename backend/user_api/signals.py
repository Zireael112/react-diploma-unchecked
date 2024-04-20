import os
from django.db.models.signals import post_save
from django.conf import settings
from django.dispatch import receiver
from .models import Users


@receiver(post_save, sender=Users)
def create_user_storage_path(sender, instance, created, **kwargs):
    if created:
        user_folder = os.path.join(settings.BASE_DIR, "media", str(instance.id))
        os.makedirs(user_folder, exist_ok=True)
        instance.storage_path = user_folder
        instance.save()
