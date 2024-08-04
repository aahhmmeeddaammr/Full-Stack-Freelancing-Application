from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from .views import sendMSG 
import random
import string

def GenerateOTP():
    digits = string.digits
    otp = ''.join(random.choice(digits) for _ in range(4))
    return otp

class GetOTP( APIView ):
    def post(self , request):
        try:
            try:
                useremail = User.objects.get(email = request.data['email'])
            except:
                useremail = None
            try:
                userOTP = OTP.objects.get(UserID = str(useremail.pk))
            except:
                userOTP =None            
            if userOTP is not None:
                userOTP.delete()
            if not useremail :
                return Response({"MSG" : "Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
            NewOtp = GenerateOTP()
            NewOTPinstance ={
                "OTP" : NewOtp ,
                "UserID": useremail.pk,
            }
            GetOTPSerializar = GetOTPSerializars(data = NewOTPinstance)
            if GetOTPSerializar.is_valid():
                GetOTPSerializar.save()
                sendMSG(useremail.email , f" Your OTP IS : {NewOtp}")
                return Response({"MSG" : "Done" , "email": useremail.email} , status= status.HTTP_200_OK)       
            return Response({"MSG" : "Invalid Data"} , status= status.HTTP_200_OK)        
        except:
            return Response({"MSG" : "Error  in server"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)        
        
class VerifyOTP( APIView ):
    def post(self ,request):
        try:
            try:
                Useremail = User.objects.get(email = request.data["email"])
            except:
                return Response({"MSG" : "Email Does not exist"} , status= status.HTTP_400_BAD_REQUEST)
            
            if 'X-hX-P--d--d--d--dx-xx--o' not in request.headers or not Useremail or  request.headers['X-hX-P--d--d--d--dx-xx--o'] !='__cssAschrcm_r_r__erwx$$d2A_$mr__I_@br_a_hi__m_Xp_p':
                return Response({"MSG" :"Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
            try:
                UserOTPV = OTP.objects.get(OTP = request.data['OTP'] , UserID = Useremail.pk) 
            except:
                return Response({"MSG" : "incorect OTP"} , status= status.HTTP_400_BAD_REQUEST)
            if not UserOTPV :
                return Response ({"MSG" : "Invalid OTP"} , status= status.HTTP_400_BAD_REQUEST)
            UserOTPV.delete()
            return Response({"MSG" : "Done" , "email" : Useremail.email} , status= status.HTTP_200_OK)
        except :
            return Response({"MSG" : "Error in server"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)
        
class ResetPassword(APIView):
    def post(self , request ):
        try : 
            try:
                useremail = User.objects.get(email = request.data['email'])
            except:
                return Response ({"MSG" : "Invalid Email"} , status=status.HTTP_400_BAD_REQUEST)
            if not useremail  or  'X-XXXXX-X-X-XXX-xxx-x' not in  request.headers or not request.headers['X-XXXXX-X-X-XXX-xxx-x'] == 'AhmedAAAAhhmedA':
                return Response({"MSG" : "Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
            if len(request.data['newpassword']) <8:
                return Response ({"Invalid Password"} , status= status.HTTP_400_BAD_REQUEST)
            useremail.set_password(request.data['newpassword'])
            useremail.save()
            return Response({"MSG" : "Done"} , status=status.HTTP_200_OK)
        except:
            return Response({"MSG" : "Error in Server"} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)