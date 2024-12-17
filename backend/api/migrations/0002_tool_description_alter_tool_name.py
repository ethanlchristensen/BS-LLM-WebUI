# Generated by Django 5.1.3 on 2024-11-28 23:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='tool',
            name='description',
            field=models.TextField(default='', null=True),
        ),
        migrations.AlterField(
            model_name='tool',
            name='name',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]