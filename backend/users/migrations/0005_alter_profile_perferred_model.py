# Generated by Django 5.1.1 on 2024-09-16 00:42

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0003_alter_conversation_id"),
        ("users", "0004_alter_profile_perferred_model_alter_profile_user"),
    ]

    operations = [
        migrations.AlterField(
            model_name="profile",
            name="perferred_model",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="preferred_model",
                to="api.ollamamodel",
            ),
        ),
    ]
