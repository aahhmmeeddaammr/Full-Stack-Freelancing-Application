# Generated by Django 5.0.6 on 2024-06-18 15:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0005_token'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='balance',
            field=models.FloatField(null=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='pendingbalance',
            field=models.FloatField(null=True),
        ),
    ]