import uuid
from django.db import models
from django.contrib.auth.models import User


class OllamaModel(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=False)
    model = models.CharField(max_length=255, unique=False)
    liked = models.BooleanField(default=False)
    color = models.CharField(
        max_length=25,
        choices=[
            ("Gray", "Gray"),
            ("Mauve", "Mauve"),
            ("Slate", "Slate"),
            ("Sage", "Sage"),
            ("Olive", "Olive"),
            ("Sand", "Sand"),
            ("Tomato", "Tomato"),
            ("Red", "Red"),
            ("Ruby", "Ruby"),
            ("Crimson", "Crimson"),
            ("Pink", "Pink"),
            ("Plum", "Plum"),
            ("Purple", "Purple"),
            ("Violet", "Violet"),
            ("Iris", "Iris"),
            ("Indigo", "Indigo"),
            ("Blue", "Blue"),
            ("Cyan", "Cyan"),
            ("Teal", "Teal"),
            ("Jade", "Jade"),
            ("Green", "Green"),
            ("Grass", "Grass"),
            ("Bronze", "Bronze"),
            ("Gold", "Gold"),
            ("Brown", "Brown"),
            ("Orange", "Orange"),
            ("Amber", "Amber"),
            ("Yellow", "Yellow"),
            ("Lime", "Lime"),
            ("Mint", "Mint"),
            ("Sky", "Sky"),
        ],
        default="Gray",
    )

    def __str__(self):
        return self.name


class Conversation(models.Model):
    id = models.UUIDField(primary_key=True, editable=False, default=uuid.uuid4)
    title = models.CharField(max_length=255)
    user = models.ForeignKey(
        User, related_name="conversations", on_delete=models.CASCADE
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    liked = models.BooleanField(default=False)

    def __str__(self):
        return f"Conversation {self.id} - {self.title}"


class UserMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to="user_message_images/", null=True, blank=True)

    def __str__(self):
        return f"User Message {self.id} - {self.conversation.user.username}"


class AssistantMessage(models.Model):
    id = models.AutoField(primary_key=True)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE)
    content = models.TextField()
    model = models.CharField(max_length=255)
    provider = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    liked = models.BooleanField(default=False)

    def __str__(self):
        return f"Assistant Message {self.id} - {self.model}"
