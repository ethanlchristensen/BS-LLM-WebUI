# Generated by Django 5.1.1 on 2024-09-19 01:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0006_assistantmessage_liked_conversation_liked"),
    ]

    operations = [
        migrations.AddField(
            model_name="ollamamodel",
            name="liked",
            field=models.BooleanField(default=False),
        ),
    ]
