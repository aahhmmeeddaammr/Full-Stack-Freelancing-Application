# Generated by Django 5.0.6 on 2024-07-09 19:59

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0025_alter_complaint_id_alter_message_id_alter_offer_id_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='Transaction',
        ),
    ]