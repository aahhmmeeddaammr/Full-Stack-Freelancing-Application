from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from django.conf import settings
from .views import JWTAuth , sendMSG 
import stripe
from django.shortcuts import redirect


stripe.api_key = settings.STRIPE_SECRET_KEY        

class GetBalanceAndTransactions(APIView):
    def get (self , request , userid):
        if not JWTAuth(request , userid):
            return Response({"MSG":"Invalid Token"} , status=status.HTTP_401_UNAUTHORIZED)
        try : 
            try:
                transactions = (RequestTransaction.objects.all().order_by('-Date'))
                WCharge = (ChargeAndWithdrow.objects.filter(UserID = userid).order_by('-Date'))
            except:
                transactions=[]
                WCharge=[]
            respon =[]
            for trans in transactions:
                if trans.RequestID and  str(trans.RequestID.UserID.pk) == str(userid) :
                    alltransactionsS = AllTransactionsSerializars( trans , many = False)
                    respon.append({
                        "Transaction":alltransactionsS.data
                        })
                if trans.OfferID and  str(trans.OfferID.UserID.id) == str(userid):
                    alltransactionsSerializar = AllTransactionsSerializars(trans , many = False)
                    respon.append({"Transaction":alltransactionsSerializar.data})
            for trans in WCharge:
                GetChargeAndWithdrowTransactionSerializer = GetChargeAndWithdrowTransactionSerializers(trans , many = False)
                respon.append({"Transaction" : GetChargeAndWithdrowTransactionSerializer.data})
            UserBalance = User.objects.get(pk = userid)
            UserBalanceSerializar = GetBalanceSerializars(UserBalance , many = False)
            return Response( {
                "Transactions" :respon , 
                "Balance" :UserBalanceSerializar.data
                } , status = status.HTTP_200_OK)
        except:
            return Response ({"MSG" : "Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)
            
class AcceptTransaction(APIView):
    def post(self , request , transactionID , userid):
        if not JWTAuth(request , userid ):
            return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        Role = User.objects.get(pk = userid)
        if not Role.is_superuser :
            return Response({"MSG" : "UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)        
        try:
            trans = RequestTransaction.objects.get(pk = transactionID)
            dbRequest = trans.RequestID
            Offerr=Offer.objects.get(RequestID = dbRequest.pk , State = True)
            transamunt = 0.8*trans.amount
            OfferOwnerBalance = User.objects.get(pk = Offerr.UserID.pk)
            OfferOwnerBalance.balance += transamunt
            OfferOwnerBalance.profit -= transamunt
            sendMSG(OfferOwnerBalance.email , f"Profit from request {dbRequest.Topic} has been transfered to your balance")
            trans.Approve=True
            trans.save()
            OfferOwnerBalance.save()
            return Response({"MSg":"DONNEEEE"} , status= status.HTTP_200_OK)
        except:
            return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)
      
class PaymentAPI(APIView):
    def post(self, request, userid):
        if not JWTAuth(request, userid):
            return Response({"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            amount = int(request.data.get('amount', 0))
            if amount < 50  :
                raise ValueError("Invalid amount Miniumum amount Must Be 50.0 EGP")
        except ValueError:
            return Response({"MSG": "Invalid amount Miniumum amount Must Be 50.0 EGP"}, status=status.HTTP_400_BAD_REQUEST)
        except TypeError:
            return Response({"MSG": "Invalid Amount "}, status=status.HTTP_400_BAD_REQUEST)
        try:
            dbuser = User.objects.get(pk = userid)
            Wait.objects.create( UserID = dbuser )
            
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[
                    {
                        'price_data': {
                            'currency': 'egp',
                            'product_data': {
                                'name': 'Charge Your Balance',
                            },
                            'unit_amount': int(amount * 100),  # Ensure amount is in the smallest currency unit
                        },
                        'quantity': 1,
                    },
                ],
                mode='payment',
                success_url=f"https://qj66k2xh-8000.uks1.devtunnels.ms/api/updatebalance/{str(amount).split('.')[0]}/{str(userid)}",
                cancel_url=f"https://qj66k2xh-8000.uks1.devtunnels.ms/api/failtransaction/{str(amount).split('.')[0]}/{str(userid)}",
            )
            return Response({"url": checkout_session.url}, status=status.HTTP_200_OK)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            return Response(
                {'error': 'Something went wrong when creating Stripe Checkout session'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UpdateBalance(APIView):
    def get(self , request , amount , userid):
        Userb = User.objects.get(pk = userid)
        try:
            waiting =Wait.objects.get(UserID = str(userid))
        except :
            return Response ({"MSG" : "You Cant Access This Link"} , status= status.HTTP_401_UNAUTHORIZED)
        waiting.delete()
        Userb.balance += float(amount)
        newTransaction = {
            'amount':float(amount),
            'Title':F"You have charged {float(amount)} EGP to your balance",
            'UserID':userid,
            "Type":f"Charge",
            "Successfull":True
        }
        print(newTransaction)
        AddChargeAndWithdrowTransactionSerializer = AddChargeAndWithdrowTransactionSerializers(data = newTransaction)
        if AddChargeAndWithdrowTransactionSerializer.is_valid():
            AddChargeAndWithdrowTransactionSerializer.save()
            Userb.save()    
            return redirect('http://localhost:3000/balance' , status.HTTP_200_OK)

class FalidTransaction(APIView):
    def get(self , request , userid ,amount):
        try:
            waiting =Wait.objects.get(UserID = str(userid))
        except :
            return Response ({"MSG" : "You Cant Access This Link"} , status= status.HTTP_401_UNAUTHORIZED)
        waiting.delete()
        return redirect('http://localhost:3000/balance' , status.HTTP_200_OK)
    

class withdraw(APIView):
    def post(self , request , userid):
        if not JWTAuth(request , userid):
            return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try:
            print(request.data)
            amount = float (request.data['amount'])
            Userbalance  = User.objects.get(pk = userid)
            if Userbalance.balance >=float(amount) :
                Userbalance.balance -= float(amount)
            else:
                return Response({"MSG" : f"Your Balance Is Less Than {float(amount)} EGP"} , status=status.HTTP_400_BAD_REQUEST)
            newTransaction = {
                'amount':float(amount),
                'Title':F"You have withdrawn {float(amount)} EGP from your balance",
                'UserID':userid , 
                "Type":"Withdraw",
                "Successfull":True
            }
            AddChargeAndWithdrowTransactionSerializer = AddChargeAndWithdrowTransactionSerializers(data = newTransaction)
            if AddChargeAndWithdrowTransactionSerializer.is_valid():
                AddChargeAndWithdrowTransactionSerializer.save()
                Userbalance.save()
                return Response({"MSG" : "Done"} , status= status.HTTP_200_OK)
            else:
                return Response({"MSG" : "Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({"MSG" : "Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)
 
