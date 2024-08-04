from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from .pagination import CustomPagination
from django.db.models import Avg 
from .views import JWTAuth , sendMSG
import logging

class AddRequestView(APIView):
    def post(self, request):
        try:
            userid = request.data.get("UserID")
            if not userid:
                return Response({"MSG": "UserID field is missing"}, status=status.HTTP_400_BAD_REQUEST)

            if not JWTAuth(request, userid):
                return Response({"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)

            USERBalance = User.objects.get(pk=userid)
            
            budget = float(request.data.get("Budget", -1))
            if budget < 40 :
                return Response({"MSG": "Invalid Budget"}, status=status.HTTP_400_BAD_REQUEST)

            if USERBalance.balance < budget :
                return Response({"MSG": "Insufficient funds, please charge first"}, status=status.HTTP_400_BAD_REQUEST)
            Category = request.data["Category"]
            if Category != "ComputerScience" and Category !="Other":
                return Response({"MSG" : "Invalid Category"} , status= status.HTTP_400_BAD_REQUEST)
            try:
                newreq = {
                    "Type": request.data.get("Type"),
                    "Topic": request.data.get("Topic"),
                    "RequestDesc": request.data.get("RequestDesc"),
                    "Budget": budget,
                    "Category":Category ,
                    "UserID": userid,
                }
            except :
                return Response({"MSG" : "Invalid Data" } , status= status.HTTP_400_BAD_REQUEST)

            addRequestSerializer = AddRequestSerializer(data=newreq)
            if addRequestSerializer.is_valid():
                instance = addRequestSerializer.save()
                skills = request.data.get("skills", [])
                for skill in skills:
                    newskill = {"RequestID": str(instance.pk), "skill": skill}
                    requestSkillSerializer = RequestSkillSerializer(data=newskill)
                    if requestSkillSerializer.is_valid():
                        requestSkillSerializer.save()
                    else:
                        instance.delete()
                        return Response({"MSG": "Invalid Skill"}, status=status.HTTP_400_BAD_REQUEST)

                USERBalance.pendingbalance += budget
                USERBalance.balance -= budget
                USERBalance.save()

                newTransaction = {
                    "RequestID": str(instance.pk),
                    "Title": f"Transfer {budget} EGP from your Available Balance to Pending Balance",
                    "amount": budget,
                }
                transactionSerializer = AddRequestTransactionSerializars(data=newTransaction)
                if transactionSerializer.is_valid():
                    transactionSerializer.save()
                    return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
                else:
                    instance.delete()
                    return Response({"MSG": "Backend Error"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logging.exception("Error in AddRequestView")
            return Response({"MSG": "Server Error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class GetAllRequestsView(APIView):
    def get(self, request, *args, **kwargs):
        category = request.query_params.get("category", None)
        rtype = request.query_params.get("type", None)
        name = request.query_params.get("search", None)
        price = request.query_params.get("price", None)
        queryset = Request.objects.filter(Approve=True, Status="Open", Decline=False).order_by("-PostDate")

        if category:
            queryset = queryset.filter(Category__icontains=category)
        if rtype:
            queryset = queryset.filter(Type__icontains=rtype)
        if price:
            try:
                queryset = queryset.filter(Budget__lte=int(price))
            except ValueError:
                return Response({"MSG": "Invalid Number"}, status=status.HTTP_400_BAD_REQUEST)
        if name:
            queryset1 = list(queryset.filter(Topic__icontains=name))
            result = []
            for req in queryset:
                if Request_Skill.objects.filter(RequestID=req.pk, skill__icontains=name).exists():
                    result.append(req)
            queryset = list(set(result + queryset1))

        paginator = CustomPagination()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            res = self.get_requests_with_offers(page)
            return paginator.get_paginated_response(res)
        res = self.get_requests_with_offers(queryset)
        return Response({"requests": res}, status=status.HTTP_200_OK)

    def get_requests_with_offers(self, requests):
        res = []
        for req in requests:
            offers = Offer.objects.filter(RequestID=req.id)
            no_of_offers = offers.count()

            get_request_serializer = GetRequestSerializer(req)
            offer_serializer = OfferSerializer(offers, many=True)

            new_req = {
                "request": get_request_serializer.data,
                "numberofOffers": no_of_offers,
                "Offers": offer_serializer.data,
                "UserName": f"{req.UserID.Fname} {req.UserID.Lname}",
            }
            res.append(new_req)
        return res

    def get_requests_with_offers(self, requests):
        res = []
        for req in requests:
            offers = Offer.objects.filter(RequestID=req.id)
            no_of_offers = offers.count()

            get_request_serializer = GetRequestSerializer(req)
            offer_serializer = OfferSerializer(offers, many=True)

            new_req = {
                "request": get_request_serializer.data,
                "numberofOffers": no_of_offers,
                "Offers": offer_serializer.data,
                "UserName":req.UserID.Fname + " " +req.UserID.Lname ,
            }
            res.append(new_req)
        return res

class GetRequestView(APIView):
    def get(self, request, reqid):
        try:
            request_instance = Request.objects.get(pk=reqid)
        except Request.DoesNotExist:
            return Response({"MSG": "Invalid request"}, status=status.HTTP_404_NOT_FOUND)

        offers = Offer.objects.filter(RequestID=reqid)
        userid = request.headers.get('UserID')

        skills = Request_Skill.objects.filter(RequestID=reqid)
        requestSkillSerializer = RequestSkillSerializer(skills, many=True)
        no_of_offers = offers.count()
        avg_offers = offers.aggregate(Avg("Price"))["Price__avg"] or 0

        my_offer = []
        has_offer = False
        can_add_offers = False
        if userid:
            try:
                my_offer = Offer.objects.get(RequestID=reqid, UserID=userid)
                my_offer_serializer = OfferSerializer(my_offer)
                my_offer = [my_offer_serializer.data]
                has_offer = True
            except Offer.DoesNotExist:
                can_add_offers = True

        get_request_serializer = GetRequestSerializer(request_instance)
        req_owner = User.objects.get(pk=request_instance.UserID.pk)
        owner_profile = ProfileSerializer(req_owner)

        return Response({
            "request": get_request_serializer.data,
            "HASOFFER": has_offer,
            "AVGOffers": avg_offers,
            "OwnerProfile": owner_profile.data,
            "MyOffer": my_offer,
            "numberofOffers": no_of_offers,
            "CanAddOffer": can_add_offers,
            "Skills": requestSkillSerializer.data,
        }, status=status.HTTP_200_OK)

class GetRequestsForUser(APIView):
    def get(self, request, userid):
        if not JWTAuth(request, userid):
            return Response({"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)

        decline = request.query_params.get("decline", None)
        approve = request.query_params.get("Approve", None)
        status_param = request.query_params.get("status", None)
        queryset = Request.objects.filter(UserID=userid).order_by("-PostDate")

        if decline is None and approve is None and status_param is None:
            queryset = queryset.filter(Status="Open")
        if decline:
            queryset = queryset.filter(Decline=(decline == "True"))
        if approve:
            queryset = queryset.filter(Approve=(approve == "True"))
        if status_param:
            if status_param == "NF":
                queryset = queryset.exclude(Status="Finish")
            else:
                queryset = queryset.filter(Status=status_param)

        try:
            dbrequests = list(queryset)
            res = []
            for req in dbrequests:
                offers = list(Offer.objects.filter(RequestID=req.id, Decline=False))
                no_of_offers = len(offers)
                acc_res = None
                try:
                    accepted_offer = Offer.objects.get(RequestID=req.id, Decline=False, State=True)
                    acc_res = accepted_offer.UserID.pk
                except Offer.DoesNotExist:
                    pass

                offers_list = []
                if no_of_offers > 0:
                    for offer in offers:
                        offer_user = User.objects.get(pk=offer.UserID.pk)
                        offer_user_serializer = ProfileSerializer(offer_user)
                        offer_serializer = OfferSerializer(offer)
                        offers_list.append({
                            "offer": {
                                "details": offer_serializer.data,
                                "user": offer_user_serializer.data,
                            }
                        })
                
                get_request_serializer = GetRequestSerializer(req)
                new_req = {
                    "request": get_request_serializer.data,
                    "numberofOffers": no_of_offers,
                    "Offers": offers_list,
                    "AcceptedOffer": acc_res
                }
                res.append(new_req)
            return Response({"requests": res}, status=status.HTTP_200_OK)
        except Exception as e:
            logging.exception("Error in GetRequestsForUser")
            return Response({"MSG": "Invalid data", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AcceptRequst(APIView):
    def post(self, request, userid, requestid):  # check for admin and jwtauth
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        dbuser = User.objects.get(pk=userid)
        if not dbuser.is_superuser: 
            return Response({"MSG": "Admins Only"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            dbrequest = Request.objects.get(pk=requestid)
            dbrequest.Approve = True
            dbrequest.save()
            sendMSG(dbrequest.UserID.email , f"The request {dbrequest.Topic} Is Approved By Xperinced.")
            return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
        except:
            return Response(
                {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
            )

class DeclineRequest(APIView):
    def post(self, request, userid, requestid):  # check for admin and jwtauth
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        dbuser = User.objects.get(pk=userid)
        if not dbuser.is_superuser:
            return Response({"MSG": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            dbrequest = Request.objects.get(pk=requestid )
            dbrequest.Decline = True
            dbrequest.UserID.pendingbalance -=float(dbrequest.Budget )
            dbrequest.UserID.balance +=float (dbrequest.Budget )
            try:
                dbrequest.DeclineReason = request.data['reason']
            except:
                return Response({"MSG" : "reason is Required"} , status=status.HTTP_400_BAD_REQUEST)
            newTransaction={
                "RequestID":dbrequest.pk
                ,"Title":F" Now We transfer {float( dbrequest.Budget)} EGP from your bending Balance To Available Balance" ,
                "amount":float(dbrequest.Budget)
            }
            AddRequestTransactionSerializar =AddRequestTransactionSerializars(data = newTransaction)
            if AddRequestTransactionSerializar.is_valid():
                AddRequestTransactionSerializar.save()
                dbrequest.UserID.save()
                dbrequest.save()
                sendMSG(dbrequest.UserID.email, f"Your request {dbrequest.Topic} Is Declined.")
                return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
        except:
            return Response(
                {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
            )

class FinishRequest(APIView):
    def post(self , request , userid , requestid):
        if not JWTAuth(request , userid):
            return Response({"MSg" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try:
            dbrequest=Request.objects.get(pk = requestid , UserID=userid)
            rating = request.data.get('rating' , None)
            INSID=request.data.get("InsID" , None)
            if rating is None:
                return Response({"MSG" : "Rating in Required"} , status= status.HTTP_400_BAD_REQUEST)
            if INSID is None :
                return Response({"MSG" : "INs Is Required"} , status= status.HTTP_400_BAD_REQUEST )
            feedback = request.data.get('feedback' , None)
            if feedback is None :
                return Response({"MSG" : "Feedback Is Required"} , status= status.HTTP_400_BAD_REQUEST)
            newRating = {
                "InsID":INSID,
                "UserID":userid,
                "requestID":requestid,
                "rating":int(rating),
                "feedback":feedback
            }
            if dbrequest:
                RatingSerializar=RatingSerializars(data=newRating)
                if RatingSerializar.is_valid():
                    try:
                        INSBalance = User.objects.get(pk = INSID)
                        INSOFFER = Offer.objects.get(RequestID = requestid , State=True)
                        INSBalance.profit += 0.8*INSOFFER.Price
                        UserBalance =  User.objects.get(pk = userid)
                        UserBalance.pendingbalance -= INSOFFER.Price
                        dbrequest.Status='Finish'
                        # ins , user => user amunt(10) , 8
                        newtransaction = {
                            "RequestID" : dbrequest.pk , 
                            'Title' : F"Finish Request With {INSOFFER.Price} EGP",
                            "amount" : INSOFFER.Price ,
                            "OfferID":INSOFFER.pk 
                        }
                        FinishRequestTransactionSerializar = FinishRequestTransactionSerializars(data = newtransaction )
                        if FinishRequestTransactionSerializar.is_valid():
                            Finstace = FinishRequestTransactionSerializar.save()
                            newRevenue = {
                                "TransID":Finstace.pk , 
                                "amount" : 0.2*INSOFFER.Price
                            }
                            revenueTransactionSerializar = revenueTransactionSerializars(data = newRevenue)
                            if revenueTransactionSerializar.is_valid():
                                revinstance =revenueTransactionSerializar.save()
                                UserBalance.save()
                                INSBalance.save()
                                RatingSerializar.save()
                                dbrequest.save()
                                sendMSG(INSBalance.email , f"The request {dbrequest.Topic} concluded at a price of {INSOFFER.Price} EGP, with a deduction of {0.2*INSOFFER.Price} EGP, resulting in a net profit of {0.8*INSOFFER.Price} EGP.")
                                sendMSG(UserBalance.email , f"The request {dbrequest.Topic}  concluded at a price of {INSOFFER.Price} EGP.")
                                return Response({"MSG":"Done"} , status=status.HTTP_200_OK)
                            else:
                                revinstance.delete()
                                Finstace.delete()
                                return Response({"MSG":"Error"} , status=status.HTTP_400_BAD_REQUEST)
                        return Response({"MSG":"Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)

                    except:
                        return Response({"MSG":"Invalid Request "} , status=status.HTTP_400_BAD_REQUEST) 
            else:
                return Response({"MSG":"Invalid Request "} , status=status.HTTP_400_BAD_REQUEST)
        except:
            return Response({"MSG":"Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)
