from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from .views import JWTAuth , sendMSG

class AddOfferView(APIView):
    def post( self , request ):
        try:
            userid = request.data["UserID"]
        except:
            return Response(
                {"MSG": "Where Is UserID feild"}, status=status.HTTP_400_BAD_REQUEST
            )
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            newreq = {
                "Offerdesc": request.data["Offerdesc"],
                "Price": request.data["Price"],
                "UserID": request.data["UserID"],
                "RequestID": request.data["RequestID"],
            }           
            addOfferSerializer = AddOfferSerializer(data=newreq)
            if addOfferSerializer.is_valid():
                addOfferSerializer.save()
            else:
                return Response(
                    {
                        "MSG": "Invalid Data"
                    }, status=status.HTTP_400_BAD_REQUEST
                )
            return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
        except:
            return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

class GetOffersForUser(APIView):
    def get(self, request, userid):
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            state = request.query_params.get("state", None)
            decline = request.query_params.get("decline", None)
            queryset = Offer.objects.filter(UserID=userid).order_by("-PostDate")
            if decline:
                if decline == "True":
                    queryset = queryset.filter(Decline=True)
                elif decline == "False":
                    queryset = queryset.filter(Decline=False)
            if state:
                if state == "True":
                    queryset = queryset.filter(State=True)
                elif state == "False":
                    queryset = queryset.filter(State=False)
            dbOffers = queryset
            res = []
            if dbOffers is not None:
                for offer in dbOffers:
                    req = Request.objects.get(pk=offer.RequestID.pk)
                    requestserializer = GetRequestSerializer(req, many=False)
                    addOfferSerializer = AddOfferSerializer(offer, many=False)
                    res.append(
                        {
                            "Offer": addOfferSerializer.data,
                            "Request": requestserializer.data,
                        }
                    )
            return Response({"Offers": res}, status=status.HTTP_200_OK)
        except:
            return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

class AcceptOffer(APIView):
    def post(self, request, userid, offerid):  # check for admin and jwtauth
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            USERBalance = User.objects.get(pk=userid)
            dboffer = Offer.objects.get(pk=offerid)
            dboffer.State = True
            dbrequest = Request.objects.get(pk=str(request.data["RequestID"]) , UserID = userid)
            print(dbrequest)
            dbrequest.Status = "Ongoing"
            reqprice = float( dbrequest.Budget )
            if dboffer.Price > reqprice :
                if USERBalance.balance < (dboffer.Price  - reqprice ):
                    return Response ({"MSG" : "Charge First"} , status= status.HTTP_400_BAD_REQUEST)
                else:
                    USERBalance.balance -= (dboffer.Price - reqprice)
                    USERBalance.pendingbalance += (dboffer.Price - reqprice)
                    newTransaction = {
                        "RequestID": str(dbrequest.pk),
                        "Title": f"Transfer {(dboffer.Price - reqprice)} EGP from your Available Balance to Pending Balance",
                        "amount": (dboffer.Price - reqprice),
                    }
                    transactionSerializer = AddRequestTransactionSerializars(data=newTransaction)
                    if transactionSerializer.is_valid():
                        transactionSerializer.save()
            elif  dboffer.Price <reqprice :
                USERBalance.balance += ( -dboffer.Price + float(reqprice))
                USERBalance.pendingbalance -= ( -dboffer.Price +reqprice)
            
            dboffer.save()
            dbrequest.save()
            USERBalance.save()
            sendMSG(dboffer.UserID.email , F"Your Offer of request {dbrequest.Topic} Is Approved")
            try:
                dboffers = Offer.objects.filter(RequestID = dbrequest.pk , State = False)
                for offer in dboffers:
                    offer.Decline = True
                    offer.save()
            except:
                pass 
            return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
        except:
            return Response(
                {"MSG": "Invalid Request"}, status=status.HTTP_400_BAD_REQUEST
            )

class DeclineOffer(APIView):
    def delete(self, request, userid, offerid):  # check for admin and jwtauth
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            dbuser = User.objects.get(pk=userid)
            dbOffer = Offer.objects.get(pk=offerid)
            dbOffer.Decline = True
            dbOffer.save()
            return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
        except:
            return Response(
                {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
            )

class DeleteOffer(APIView):
    def delete(self , request , userid , offerid):
        if not JWTAuth(request , userid):
            return Response({"MSG": " Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try : 
            offer = Offer.objects.get(pk = offerid , UserID=userid)
            if offer.RequestID.Status=="Ongoing" and offer.State == True:
                return Response ({"MSG" : "You Can't Remove This Offer"} , status= status.HTTP_400_BAD_REQUEST)
            elif offer.RequestID.Status=="Finish" and offer.State == True:
                return Response ({"MSG" : "You Can't Remove This Offer"} , status= status.HTTP_400_BAD_REQUEST)
            offer.delete()
            return Response({"MSG":"Done"} , status=status.HTTP_200_OK)
        except:
            return Response({"MSG":"Invalid Data "} , status=status.HTTP_400_BAD_REQUEST)
        