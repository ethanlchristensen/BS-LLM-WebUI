# Generated by Django 5.1.3 on 2025-02-22 08:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_settings_use_tools"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="image",
            field=models.ImageField(
                default="profile_pics/default/default.png", upload_to="profile_pics/"
            ),
        ),
    ]
