# Generated by Django 5.0.6 on 2024-07-07 02:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0017_complaint_type_complaint_request'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='Facebook',
            field=models.URLField(null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='WebSite',
            field=models.URLField(null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='secweb',
            field=models.URLField(null=True),
        ),
    ]
