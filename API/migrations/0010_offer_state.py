# Generated by Django 5.0.6 on 2024-06-21 23:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0009_rating'),
    ]

    operations = [
        migrations.AddField(
            model_name='offer',
            name='State',
            field=models.BooleanField(default=False),
        ),
    ]