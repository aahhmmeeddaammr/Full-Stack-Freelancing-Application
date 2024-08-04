from rest_framework import serializers
from .models import *
import datetime
#User Profile

class UserSerializer(serializers.ModelSerializer): # I Use It For SignUp 
    class Meta:
        model=User
        fields=['id','Fname','Lname','email','password',]
        extra_kwargs={
            'password':{'write_only':True},
            'id':{'read_only':True}
        }
    def create(self , validated_data):    
        password=validated_data.pop('password',None)
        isinstance = self.Meta.model(**validated_data)
        if password is not None:
            isinstance.set_password(password)
        isinstance.save()
        return isinstance
    
class ProfileSerializer(serializers.ModelSerializer): 
    class Meta:
        model=User
        fields=[ 'id', 'Fname' , 'phone', 'Lname' , 'profiledescription' , 'email' , 'Title' , 'HourSalary' , 'profileImage'  , 'BirthDate' ,'Faculty']

class TokensSerializer(serializers.ModelSerializer):
    class Meta:
        model=Token
        fields='__all__'
        extra_kwargs={
            'UserID':{'write_only':True}
        }
       
class UserSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model=User_Skill
        fields='__all__'
    
class CompleteProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=['phone' , 'profiledescription' , 'BirthDate' ,'profileImage' , 'Title' ,'HourSalary' ,'Faculty']

# Requests

class AddRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Request
        fields =['Type', 'Topic' , 'RequestDesc' , 'Budget' , 'Category'  , 'UserID' ]
        extra_kwargs={
            'id':{'read_only':True}
        }

class GetRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model=Request
        fields ='__all__'

class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields='__all__'

class RequestSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model=Request_Skill
        fields='__all__'
    
class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model=Rating
        fields='__all__'

#Offer

class AddOfferSerializer(serializers.ModelSerializer):
    class Meta:
        model=Offer
        fields ="__all__"
        extra_kwargs={
            'id':{'read_only':True}
        }

#chat

class Messageserializers(serializers.ModelSerializer):
    class Meta:
        model=Message
        fields ="__all__"
        extra_kwargs={
            'id':{
                'read_only':True
            },
            "date":{
                'read_only':True
            }
        }

#Problems   
         
class Problemserializers(serializers.ModelSerializer):
    class Meta:
        model=Complaint
        fields ='__all__'
                   
class AddProblemserializers(serializers.ModelSerializer):
    class Meta:
        model=Complaint
        fields =['message' , 'phone' ,'Type' ,'email']
                   
class RatingSerializars(serializers.ModelSerializer):
    class Meta:
        model=Rating
        fields= [ 'InsID' , 'UserID' , 'requestID' , 'rating']

#
class GetBalanceSerializars(serializers.ModelSerializer):
    class Meta:
        model=User
        fields= [ 'balance' , 'profit' , 'pendingbalance' ]

class GetOTPSerializars(serializers.ModelSerializer):
    class Meta:
        model=OTP
        fields= '__all__'
              
class AddRequestTransactionSerializars(serializers.ModelSerializer):
    class Meta:
        model = RequestTransaction
        fields = ['RequestID' , 'Title' , 'amount']     

class AcceptTransactionSerializars(serializers.ModelSerializer):
    class Meta:
        model = RequestTransaction    
        fields = ['RequestID' , 'Title' , 'amount' , "OfferID" ]     

class FinishRequestTransactionSerializars(serializers.ModelSerializer):
    class Meta:
        model = RequestTransaction
        fields = ['RequestID' , 'Title' , 'amount' , "OfferID"  ]     

class AllTransactionsSerializars(serializers.ModelSerializer):
    class Meta:
        model = RequestTransaction
        fields = ['RequestID' , 'Title' , 'amount' , "OfferID" ,'Date' , 'Approve' ,'id']
        
class revenueTransactionSerializars(serializers.ModelSerializer):
    class Meta:
        model = revenue
        fields = ['TransID','amount']     

class AddChargeAndWithdrowTransactionSerializers(serializers.ModelSerializer):
    class Meta:
        model = ChargeAndWithdrow
        fields = ['UserID' , 'Title' , 'amount' , 'Type' , 'Successfull']
        
class GetChargeAndWithdrowTransactionSerializers(serializers.ModelSerializer):
    class Meta:
        model = ChargeAndWithdrow
        fields = '__all__'


def check_expiry_month(value):
    if not 1 <= int(value) <= 12:
        raise serializers.ValidationError("Invalid expiry month.")


def check_expiry_year(value):
    today = datetime.datetime.now()
    if not int(value) >= today.year:
        raise serializers.ValidationError("Invalid expiry year.")


def check_cvc(value):
    if not 3 <= len(value) <= 4:
        raise serializers.ValidationError("Invalid cvc number.")


def check_payment_method(value):
    payment_method = value.lower()
    if payment_method not in ["card"]:
        raise serializers.ValidationError("Invalid payment_method.")

class CardInformationSerializer(serializers.Serializer):
    card_number =serializers.CharField( max_length=150, required=True)
    expiry_month = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_expiry_month],
    )
    expiry_year = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_expiry_year],
    )
    cvc = serializers.CharField(
        max_length=150,
        required=True,
        validators=[check_cvc],
    )