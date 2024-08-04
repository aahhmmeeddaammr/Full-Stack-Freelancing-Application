from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from .views import JWTAuth , sendMSG

class SendComplaint(APIView):
    def post(self , request):
        try:
            message = request.data['message']
            email = request.data['email']
            phone = request.data['phone']
            newproblem = {
                "email": email,
                "phone": phone , 
                "message" : message,
                "Type":"User Complanet"
            }
            problemserializers=AddProblemserializers(data= newproblem)
            print(problemserializers.error_messages)
            if problemserializers.is_valid():
                problemserializers.save()
                return Response({"MSG":"Done"} , status= status.HTTP_200_OK)
            else:
                return Response({"MSG":problemserializers.error_messages} , status= status.HTTP_400_BAD_REQUEST)
        except:
            return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)

class RequestComplaint(APIView):
    def post(self , request):
        try:
            message = request.data['message']
            requestID = request.data['requestID']
            UserID = request.data['UserID']
            if not JWTAuth(request , UserID):
                return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
            dbUser = User.objects.get(pk = UserID)
            dbrequest = Request.objects.get(pk = requestID)
            email = dbUser.email
            phone = dbUser.phone
            newproblem = {
                "email":email,
                "phone":phone , 
                "message" : message , 
                "request" : dbrequest.pk
            }
            problemserializers=Problemserializers(data= newproblem)
            if problemserializers.is_valid():
                problemserializers.save()
                return Response({"MSG":"Done"} , status= status.HTTP_200_OK)
            else:
                return Response({"MSG":"Fuck Khalid"} , status= status.HTTP_400_BAD_REQUEST)
                
        except:
            return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)

class GetAllComplaint(APIView):
    def get(self  , request , adminid):
        if not JWTAuth(request , adminid):
            return Response({ "MSG" : "Invalid Token" } , status= status.HTTP_401_UNAUTHORIZED)
        dbAdmin = User.objects.get(pk = adminid )
        if not dbAdmin.is_superuser:
            return Response({"MSG" : "Invalid Role"}  , status=status.HTTP_401_UNAUTHORIZED)
        try:
            AllComplaint = Complaint.objects.filter( seen = False)
            Problemserializer = Problemserializers(AllComplaint, many = True)
            return Response({"complaints":Problemserializer.data} , status=status.HTTP_200_OK)
        except:
            return Response({"MSG":"Invaild Data"} , status=status.HTTP_400_BAD_REQUEST)
        
class ReplyComlaint(APIView):
    def post(self , request , adminid , complaintid):
        try:
            if not JWTAuth(request , adminid):
                return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
            try :
                dbuser = User.objects.get(pk = adminid)
                if not dbuser.is_superuser:
                    return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED)
            except:
                return Response ({"MSG" : " INVALID USER"} , status=status.HTTP_401_UNAUTHORIZED)
            try:
                response = request.data['response']
            except :
                return Response ({"MSG" : "Invalid Response"} , status= status.HTTP_400_BAD_REQUEST)
            try:
                dbcomplaint = Complaint.objects.get(pk = complaintid)
            except:
                return Response({"MSG": "Invalid Complaint ID"} , status=status.HTTP_400_BAD_REQUEST)
            sendMSG(dbcomplaint.email , f"Hello ,{response}")
            dbcomplaint.seen=True
            dbcomplaint.save()
            return Response({"MSG" : "Done"} , status=status.HTTP_200_OK )
        except:
            return Response({"MSG":"Server Error"} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)                    
