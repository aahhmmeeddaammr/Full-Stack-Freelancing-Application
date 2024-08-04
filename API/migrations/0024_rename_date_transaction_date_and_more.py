# Generated by Django 5.0.6 on 2024-07-09 16:29

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('API', '0023_otp'),
    ]

    operations = [
        migrations.RenameField(
            model_name='transaction',
            old_name='date',
            new_name='Date',
        ),
        migrations.RenameField(
            model_name='transaction',
            old_name='Description',
            new_name='Title',
        ),
        migrations.RenameField(
            model_name='transaction',
            old_name='Amount',
            new_name='amount',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='Admin',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='OfferOwner',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='RequestOwner',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='Topic',
        ),
        migrations.RemoveField(
            model_name='transaction',
            name='requestID',
        ),
        migrations.AddField(
            model_name='transaction',
            name='UserID',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
        migrations.CreateModel(
            name='RequestTransaction',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Date', models.DateTimeField(default=django.utils.timezone.now)),
                ('amount', models.FloatField()),
                ('Title', models.TextField()),
                ('Approve', models.BooleanField(default=False)),
                ('OfferID', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='API.offer')),
                ('RequestID', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='API.request')),
            ],
        ),
        migrations.CreateModel(
            name='revenue',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.FloatField()),
                ('TransID', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='API.requesttransaction')),
            ],
        ),
    ]