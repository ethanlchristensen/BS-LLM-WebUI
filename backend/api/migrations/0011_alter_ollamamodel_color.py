# Generated by Django 5.1.1 on 2024-09-29 07:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0010_alter_ollamamodel_color"),
    ]

    operations = [
        migrations.AlterField(
            model_name="ollamamodel",
            name="color",
            field=models.CharField(
                choices=[
                    ("gray", "gray"),
                    ("mauve", "mauve"),
                    ("slate", "slate"),
                    ("sage", "sage"),
                    ("olive", "olive"),
                    ("sand", "sand"),
                    ("tomato", "tomato"),
                    ("red", "red"),
                    ("ruby", "ruby"),
                    ("crimson", "crimson"),
                    ("pink", "pink"),
                    ("plum", "plum"),
                    ("purple", "purple"),
                    ("violet", "violet"),
                    ("iris", "iris"),
                    ("indigo", "indigo"),
                    ("blue", "blue"),
                    ("cyan", "cyan"),
                    ("teal", "teal"),
                    ("jade", "jade"),
                    ("green", "green"),
                    ("grass", "grass"),
                    ("bronze", "bronze"),
                    ("gold", "gold"),
                    ("brown", "brown"),
                    ("orange", "orange"),
                    ("amber", "amber"),
                    ("yellow", "yellow"),
                    ("lime", "lime"),
                    ("mint", "mint"),
                    ("sky", "sky"),
                ],
                default="Gray",
                max_length=25,
            ),
        ),
    ]
