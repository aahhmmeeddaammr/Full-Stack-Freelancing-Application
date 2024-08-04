from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import BaseUserManager
from django.contrib.auth.management.commands.createsuperuser import Command as CreateSuperuserCommand
from django.core.management import CommandError
from django.utils import timezone
import uuid

class Command(CreateSuperuserCommand):
    def handle(self, *args, **options):
        if not options['email']:
            raise CommandError('You must provide an email address')
        if not options.get('birthdate'):
            raise CommandError('You must provide a birthdate')
        
        super().handle(*args, **options)

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument('--birthdate', dest='birthdate', required=True, help='Superuser birthdate (YYYY-MM-DD)')


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)
    

class User ( AbstractUser ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Fname = models.CharField ( max_length = 100)
    Lname = models.CharField ( max_length = 100 )
    email = models.EmailField ( max_length = 100, unique = True) # must be emailfield
    password = models.CharField ( max_length=50 , null = True)
    phone = models.CharField ( max_length = 11 , null = True)
    BirthDate = models.DateField( null = True )
    profiledescription = models.TextField ( null=True)
    Faculty = models.CharField( max_length=50 )
    # User Balance  
    balance = models.FloatField (  default=0.0 ) # ال متاح انه يسحبه كله 
    pendingbalance = models.FloatField (  default=0.0 ) # ONHold
    profit = models.FloatField(default=0.0) # هيتحول ل Available لما ال admin يوافق 
    
    profileImage = models.ImageField( upload_to = 'Images', null = True)
    Title = models.CharField ( max_length = 100 , null = True )
    HourSalary=models.FloatField ( null = True )
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [ 'Fname' ,  'Lname' ]
    objects = CustomUserManager()  # Set the custom user manager
    def __str__(self):
        return self.email

class User_Skill ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    UserID= models.ForeignKey(User , on_delete= models.CASCADE )
    skill=models.CharField( max_length=50)
    class Meta:
        unique_together=[['UserID' , 'skill']]

class Token ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Token=models.CharField( max_length=500)
    UserId=models.ForeignKey(User , on_delete=models.CASCADE)

class Request ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Approve=models.BooleanField(default=False , null=False)
    Status=models.CharField(max_length=50,default='Open' , null=False)
    Type=models.CharField(max_length=50 )
    Topic=models.CharField(max_length=50)
    RequestDesc=models.TextField(max_length=300)
    Budget=models.IntegerField()
    Category=models.CharField(max_length=100)
    UserID=models.ForeignKey(User, on_delete=models.CASCADE)
    Decline=models.BooleanField(default=False , null=False)
    PostDate=models.DateTimeField( default= timezone.now)
    DeclineReason = models.TextField(default='' , null = True)
    
class Request_Skill ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    RequestID = models.ForeignKey(Request , on_delete=models.CASCADE)
    skill = models.CharField(max_length=50)
    class Meta:
        unique_together=['RequestID','skill']

class Offer ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Offerdesc=models.TextField(max_length=100)
    Price=models.IntegerField()
    UserID=models.ForeignKey(User,on_delete=models.CASCADE)
    RequestID=models.ForeignKey( Request , on_delete=models.CASCADE )
    State = models.BooleanField( null=False , default=False)
    Decline = models.BooleanField( null=False , default=False)
    PostDate = models.DateTimeField(default=timezone.now)
    class Meta:
        unique_together=[ 'UserID', 'RequestID' ]
 
class Rating ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    InsID = models.ForeignKey(User, related_name='ratings_received', on_delete=models.CASCADE)
    UserID = models.ForeignKey(User, related_name='ratings_given', on_delete=models.CASCADE)
    requestID=models.ForeignKey( Request , on_delete=models.CASCADE)
    rating=models.IntegerField(null=False)
    feedback = models.TextField()
    class Meta:
        unique_together=[ 'UserID'  , 'InsID' , 'requestID' ]

class Message ( models.Model ):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(User , related_name='Sender', on_delete=models.CASCADE)
    Content = models.TextField()
    request = models.ForeignKey( Request , on_delete= models.CASCADE)
    date = models.DateTimeField( default= timezone.now)

class Complaint(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField()
    phone=models.CharField(max_length=11)
    message = models.TextField()
    seen = models.BooleanField(default=False)
    Type = models.CharField(max_length=30 , null=True , default='')
    request = models.ForeignKey(Request, on_delete=models.SET_NULL, null=True, blank=True)
    PostDate = models.DateTimeField(default=timezone.now)
    

class RequestTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Date = models.DateTimeField(default=timezone.now)
    amount = models.FloatField(null = False)
    Title = models.TextField()
    Approve = models.BooleanField(default= False)
    RequestID = models.ForeignKey(Request , on_delete= models.SET_NULL , null = True)
    OfferID = models.ForeignKey(Offer ,  null = True,on_delete= models.SET_NULL ) 

class revenue(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    TransID = models.ForeignKey(RequestTransaction , on_delete= models.SET_NULL , null = True)
    amount = models.FloatField(null = False)

class ChargeAndWithdrow(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    Date = models.DateTimeField(default=timezone.now)
    amount = models.FloatField(null = False)
    Title = models.TextField()
    Type =models.CharField(max_length=50)
    UserID = models.ForeignKey(User , on_delete= models.SET_NULL , null = True)
    Successfull = models.BooleanField(null=False)

class OTP(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    OTP = models.CharField(max_length=4)
    UserID = models.ForeignKey(User , on_delete= models.CASCADE)
    class Meta :
        unique_together = ['OTP' , 'UserID']
        
class Wait(models.Model):
    UserID = models.ForeignKey(User , on_delete= models.CASCADE)
    