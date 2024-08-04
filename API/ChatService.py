from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from .views import JWTAuth 

class SendMessage(APIView):
    def post(self, request, userid, requestid):
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            dboffer = Offer.objects.get( RequestID = requestid , State = True)
            dbrequest = Request.objects.get(pk = requestid)
            if str(dbrequest.UserID.pk) != str(userid) and str(dboffer.UserID.pk)  != str( userid ):
                return Response({"MSG" : "unauthorized"} , status= status.HTTP_401_UNAUTHORIZED)
        except:
            return Response({"MSG" : "Invalid Data "} , status= status.HTTP_400_BAD_REQUEST)
        try:
            Content = request.data["content"]
            NewMessage = {
                "sender": userid,
                "Content": Content,
                "request": requestid,
            }
            MessageS = Messageserializers(data=NewMessage)
            if MessageS.is_valid():
                MessageS.save()
                return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
            return Response(
                {"MSG": "Invaild Data Bro I Want  to Fuck Nabeh  "},
                status=status.HTTP_200_OK,
            )
        except:
            return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

class GetChat(APIView):
    def get( self , request , requestid ,userid):
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token "}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            dbrequest = Request.objects.get(pk = requestid)
            dboffer = Offer.objects.get(RequestID =requestid , State = True )
            if userid != str(dbrequest.UserID.pk) and userid != str(dboffer.UserID.pk):
                return Response({"MSG" : "UNAUTHORIZED"} ,status= status.HTTP_401_UNAUTHORIZED)
            AllMessage = list(
                Message.objects.filter(request=requestid).order_by('-date')
            )
            res=[]            
            requestOwnerProfile = ProfileSerializer(dbrequest.UserID , many = False)
            OfferOwnerProfile = ProfileSerializer(dboffer.UserID , many = False)
            ress ={
                    
                    "request":GetRequestSerializer(dbrequest , many = False).data,
                    "Offer": OfferSerializer(dboffer , many =False).data ,
                }
            if(requestOwnerProfile.data['id'] == str(userid)):
                ress["ContactProfile"] =OfferOwnerProfile.data 
                ress['RoleInchat'] = 'RequestOwner'
            if (OfferOwnerProfile.data['id'] == str(userid)):
                ress["ContactProfile"] =requestOwnerProfile.data 
                ress['RoleInchat'] = 'OfferOwner'
                
            for message in AllMessage:
                AllMessageS = Messageserializers(message, many=False)
                sender = User.objects.get(pk=message.sender.pk)
                senderS = ProfileSerializer(sender, many=False)
                res.append({
                    "message":AllMessageS.data,
                    "sender":senderS.data,
                })
            ress['messages']=res
            return Response(ress,status=status.HTTP_200_OK)
        except:
            return Response({"MSG": "Fuck Nabeh"}, status=status.HTTP_200_OK)
       