# Generated by Django 5.1.1 on 2024-09-16 00:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_ollamamodel"),
    ]

    operations = [
        migrations.AlterField(
            model_name="conversation",
            name="id",
            field=models.UUIDField(editable=False, primary_key=True, serialize=False),
        ),
    ]
