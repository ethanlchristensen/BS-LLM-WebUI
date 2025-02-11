# Generated by Django 5.1.3 on 2024-11-28 23:49

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ContentVariation',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('content', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Model',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('model', models.CharField(max_length=255)),
                ('liked', models.BooleanField(default=False)),
                ('provider', models.CharField(max_length=255)),
                ('color', models.CharField(choices=[('gray', 'gray'), ('mauve', 'mauve'), ('slate', 'slate'), ('sage', 'sage'), ('olive', 'olive'), ('sand', 'sand'), ('tomato', 'tomato'), ('red', 'red'), ('ruby', 'ruby'), ('crimson', 'crimson'), ('pink', 'pink'), ('plum', 'plum'), ('purple', 'purple'), ('violet', 'violet'), ('iris', 'iris'), ('indigo', 'indigo'), ('blue', 'blue'), ('cyan', 'cyan'), ('teal', 'teal'), ('jade', 'jade'), ('green', 'green'), ('grass', 'grass'), ('bronze', 'bronze'), ('gold', 'gold'), ('brown', 'brown'), ('orange', 'orange'), ('amber', 'amber'), ('yellow', 'yellow'), ('lime', 'lime'), ('mint', 'mint'), ('sky', 'sky')], default='Gray', max_length=25)),
            ],
        ),
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('liked', models.BooleanField(default=False)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Tool',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=255)),
                ('script', models.TextField(unique=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tools', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='UserMessage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('image', models.ImageField(blank=True, max_length=255, null=True, upload_to='user_message_images/')),
                ('is_deleted', models.BooleanField(default=False)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.conversation')),
            ],
        ),
        migrations.CreateModel(
            name='AssistantMessage',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('provider', models.CharField(max_length=255)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('liked', models.BooleanField(default=False)),
                ('is_deleted', models.BooleanField(default=False)),
                ('deleted_at', models.DateTimeField(blank=True, null=True)),
                ('content_variations', models.ManyToManyField(to='api.contentvariation')),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.conversation')),
                ('model', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.model')),
                ('generated_by', models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='api.usermessage')),
            ],
        ),
    ]
