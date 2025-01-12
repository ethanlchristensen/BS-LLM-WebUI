from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import User
from PIL import Image
from api.models import Model


class Profile(models.Model):
    user = models.OneToOneField(
        User, related_name="userprofile", on_delete=models.CASCADE
    )
    image = models.ImageField(
        default="profile_pics/default/default.jpg", upload_to="profile_pics/"
    )
    bio = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} Profile"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        img = Image.open(self.image.path)

        # is it not a gif and do we need to resize?
        if (img.height > 300 or img.width > 300) and img.format != "GIF":
            output_size = (300, 300)
            img.thumbnail(output_size)
            img.save(self.image.path)
        # is it a gif and do we need to resize?
        elif (img.height > 300 or img.width > 300) and img.format == "GIF":
            frames = []
            try:
                while True:
                    frames.append(img.copy())
                    img.seek(len(frames))
            except EOFError:
                pass

            # Get longest dimension
            longest_side = max(img.width, img.height)

            # Scale down proportionally if needed
            if longest_side > 300:
                scale = 300 / longest_side
                new_size = (int(img.width * scale), int(img.height * scale))
            else:
                new_size = (img.width, img.height)

            # Resize all frames
            frames = [frame.resize(new_size, Image.LANCZOS) for frame in frames]

            # Save the animated GIF
            if len(frames) > 0:
                frames[0].save(
                    self.image.path,
                    save_all=True,
                    append_images=frames[1:],
                    optimize=False,
                    duration=img.info.get("duration", 100),
                    loop=img.info.get("loop", 0),
                )


class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True, null=True, blank=True)


class Settings(models.Model):
    class Meta:
        verbose_name = "Setting"
        verbose_name_plural = "Settings"

    class ThemeChoices(models.TextChoices):
        LIGHT = "light", "Light"
        DARK = "dark", "Dark"

    user = models.OneToOneField(
        User, related_name="usersettings", on_delete=models.CASCADE
    )
    preferred_model = models.ForeignKey(
        Model,
        related_name="preferred_model",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    stream_responses = models.BooleanField(default=False)
    theme = models.CharField(
        max_length=5,
        choices=ThemeChoices.choices,
        default=ThemeChoices.LIGHT,
    )
    use_message_history = models.BooleanField(default=True)
    message_history_count = models.IntegerField(default=5)
    use_tools = models.BooleanField(default=False)

    def __str__(self):
        return f"Settings for {self.user.username}"
