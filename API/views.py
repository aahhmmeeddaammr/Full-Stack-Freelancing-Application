from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
import jwt, datetime
from .pagination import CustomPagination
from django.db.models import Avg 
from django.conf import settings
from django.core.mail import send_mail

#Authentication Funciton T Check if User in Our DB And Has a correct Token

def JWTAuth(request, userid):
    if "Token" not in request.headers:
        return False
    try:
        token ="b'" + request.headers["token"] + "'"
        
        checktoken = Token.objects.get(Token=token)
        # print()
    except:
        return False
    if str(checktoken.UserId.pk)!=str(userid):
        print('jjj')
        return False
    return True

def sendMSG(email, MSG):
    subject = "welcome to Xperienced"
    message = MSG
    email_from = settings.EMAIL_HOST_USER
    recipient_list = [
        email,
    ]
    send_mail(subject, message, email_from, recipient_list)
    
# profile -->Done 100%

# class SignupView(APIView):
#     def post(self, request):
#         try:
#             useremail = request.data["email"]
#         except:
#             return Response(
#                 {"MSG": "Enter Valid Data"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         try:
#             usercheck = User.objects.get(email=useremail)
#             return Response(
#                 {"MSG": "This User is exist"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         except:
#             newuserserial = UserSerializer(data=request.data)
#             if newuserserial.is_valid():
#                 newuserserial.save()
#                 sendMSG(newuserserial.data['email'], "Welcome To Xperienced We Are Love You")
#                 return Response(
#                     {"MSG": "Fuck Nabeh", "User": newuserserial.data},
#                     status=status.HTTP_200_OK,
#                 )
#             return Response(
#                 {"MSG": "Enter Valid Data"}, status=status.HTTP_400_BAD_REQUEST
#             )

# class LoginView(APIView):
#     def post(self, request):
#         try:
#             useremai = request.data["email"]
#             userpass = request.data["password"]
#         except:
#             return Response(
#                 {"MSG": "Enter Valid Data"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         try:
#             dbuser = User.objects.get(email=useremai)
#         except:
#             return Response(
#                 {"MSG": "Incorrect email"}, status=status.HTTP_400_BAD_REQUEST
#             )

#         if not dbuser.check_password(userpass):
#             return Response(
#                 {"MSG": "Incorrect Password"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         Role = "User"
#         if dbuser.is_superuser:
#             Role = "Admin"
#         profileserializer = ProfileSerializer(dbuser)
#         payload = {
#             "id": profileserializer.data['id'],
#             "name": dbuser.Fname + " " + dbuser.Lname,
#             "email": dbuser.email,
#             "Role": Role,
#             "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=100),
#             "iat": datetime.datetime.utcnow(),
#         }
#         token = jwt.encode(payload, "secret", algorithm="HS256").encode("utf-8")
#         try:
#             dbtoken = Token.objects.get(Token = token , UserId = dbuser)
#         except:
#             dbtoken = None
#         if dbtoken is None:    
#             nToken = Token(Token=token, UserId=dbuser)
#             nToken.save()
#             Respons = Response()
#         else:
#             token = dbtoken.Token
            
#         Respons.data = {"MSG": "done", "token": token, "User": profileserializer.data}
#         return Respons


# class LogoutVeiw(APIView):
#     def delete(self, request, userid_slug):
#         if not JWTAuth(request, userid_slug):
#             return Response(
#                 {"MSG": "invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             token = "b'" + request.headers["token"] + "'"
#             UserToken = Token.objects.get(Token=token)
#             UserToken.delete()
#         except:
#             return Response(
#                 {"MSG": "Invalid User"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         return Response({"MSG": "DONE"}, status=status.HTTP_200_OK)

# class GetProfileView(APIView):
#     def get(self, request, userid_slug):
#         try:
#             try:
#                 Userprofile = User.objects.get(pk=userid_slug)
#                 UserSkills = User_Skill.objects.filter(UserID=Userprofile.id)
#                 userSkillSerializer = UserSkillSerializer(UserSkills, many=True)
#                 Userprojects = Rating.objects.filter(InsID=Userprofile.id)
#                 userRating = Userprojects.aggregate(Avg("rating"))["rating__avg"]
#             except:
#                 return Response({"MSG" : "Data are inCorrect"} , status= status.HTTP_400_BAD_REQUEST )
            
#             allprojects = list(Userprojects)
#             res = []
#             for project in allprojects:
#                 dbproject = Request.objects.get(pk=project.requestID.pk)
#                 projectserial = GetRequestSerializer(dbproject, many=False)
#                 res.append(projectserial.data)
#             lenocp = len(res)
#         except:
#             return Response(
#                 {"MSG": "Invalid User"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         ProfileSerializers = ProfileSerializer(Userprofile, many=False)
#         return Response(
#             {
#                 "profile": ProfileSerializers.data,
#                 "Skills": userSkillSerializer.data,
#                 "Rating": userRating,
#                 "CompletedProjects": res,
#                 "NoOfCompletedProjects": lenocp,
#             },
#             status=status.HTTP_200_OK,
#         )

# class CompleteProfile(APIView):
#     def post(self, request, id):
#         try:
#             dbuser = User.objects.get(pk=id)
#         except:
#             return Response({"MSG": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             userskills = str(request.data["skills"]).split(",")
#             for skill in userskills:
#                 newskill = {"UserID": dbuser.pk, "skill": skill}
#                 userSkillSerializer = UserSkillSerializer(data=newskill)
#                 if userSkillSerializer.is_valid():
#                     userSkillSerializer.save()
#                 else:
#                     continue
#             dbuser.phone = request.data["phone"]
#             dbuser.age = request.data["age"]
#             dbuser.profiledescription = request.data["profiledescription"]
#             dbuser.profileImage = request.FILES["image"]
#             dbuser.HourSalary = request.data["HourSalary"]
#             dbuser.Title = request.data["title"]
#         except:
#             return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
#         dbuser.balance = 0.0
#         dbuser.pendingbalance = 0.0
#         dbuser.save()
#         return Response({"MSG": "done"}, status=status.HTTP_200_OK)

# class EditProfileVeiw(APIView):
#     def put(self, request, userid):
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             dbuser = User.objects.get(pk=userid)
#         except:
#             return Response({"MSG": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             userskills = request.data["newskills"]
#             if userskills:
#                 userNewSkills = list(str(userskills).split(","))
#                 for skill in userNewSkills:
#                     newskill = {"UserID": dbuser.pk, "skill": skill}
#                     userSkillSerializer = UserSkillSerializer(data=newskill)
#                     if userSkillSerializer.is_valid():
#                         userSkillSerializer.save()
#                     else:
#                         continue
#             userdeleteskills = request.data["deleteskills"]
#             if userdeleteskills:
#                 try:
#                     removedSkills = list(str(userdeleteskills).split(","))
#                     for skill in removedSkills:
#                         deleteskill = User_Skill.objects.filter(UserID=dbuser.id).get(
#                             skill=skill
#                         )
#                         deleteskill.delete()
#                 except:
#                     return Response(
#                         {"MSG": "Cannot delete skills"},
#                         status=status.HTTP_400_BAD_REQUEST,
#                     )
#             dbuser.Fname = request.data["Fname"]
#             dbuser.Lname = request.data["Lname"]
#             dbuser.phone = request.data["phone"]
#             dbuser.age = request.data["age"]
#             dbuser.profiledescription = request.data["profiledescription"]
#             if request.FILES:
#                 dbuser.profileImage = request.FILES["image"]
#             dbuser.HourSalary = request.data["HourSalary"]
#             dbuser.Title = request.data["title"]
#         except:
#             return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
#         dbuser.save()
#         return Response({"MSG": "done"}, status=status.HTTP_200_OK)

# # request Views --> done 90%

# class AddRequestView(APIView):
#     def post(self, request):
#         try:
#             userid = request.data["UserID"]
#         except:
#             return Response(
#                 {"MSG": "Where Is UserID feild"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             newreq = {
#                 "Type": request.data["Type"],
#                 "Topic": request.data["Topic"],
#                 "RequestDesc": request.data["RequestDesc"],
#                 "Budget": request.data["Budget"],
#                 "Category": request.data["Category"],
#                 "UserID": request.data["UserID"],
#             }
#             USERBalance = User.objects.get(pk = str(userid))
#             try:
#                 Allreq = Request.objects.filter(UserID = userid , Approve =True).aggregate(sum('Budget'))
#             except:
#                 Allreq=0
#             if float(request.data["Budget"]) < 0 :
#                 return Response({"MSG" : "Invalid Budget"} , status= status.HTTP_400_BAD_REQUEST)
#             AllRequests = float( Allreq ) + float(request.data["Budget"])
#             if float(USERBalance.balance) <= AllRequests :
#                 return Response({"MSG" : "Charge First"} , status= status.HTTP_400_BAD_REQUEST)
#             addRequestSerializer = AddRequestSerializer(data=newreq)
#             instance=Request
#             if addRequestSerializer.is_valid():
#                 instance = addRequestSerializer.save()
#                 requstskills = list(request.data["skills"])
#                 for skill in requstskills:
#                     newskill = {"RequestID": instance.pk, "skill": skill}
#                     requestSkillSerializer = RequestSkillSerializer(data=newskill)
#                     if requestSkillSerializer.is_valid():
#                         requestSkillSerializer.save()
#                     else:
#                         instance.delete()
#                         return Response(
#                             {"MSG": "Invalid Skill"}, status=status.HTTP_400_BAD_REQUEST
#                         )
#             else:
#                 instance.delete()
#                 return Response(
#                     {"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST
#                 )
#             USERBalance.pendingbalance += float( request.data["Budget"]) 
#             USERBalance.balance -= float( request.data["Budget"]) 
#             newTransaction={
#                 "RequestID":instance.pk
#                 , "Title":F"Ok Now We transfer {float( request.data["Budget"])} EGP from your Available Balance To bending Balance" ,
#                 "amount":float( request.data["Budget"])
#             }
#             AddRequestTransactionSerializar =AddRequestTransactionSerializars(data = newTransaction)
#             if AddRequestTransactionSerializar.is_valid():
#                 AddRequestTransactionSerializar.save()
#                 USERBalance.save()
#                 return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
#             return Response({"MSG" : "Backend Error"} , status= status.HTTP_400_BAD_REQUEST)
#         except:
#             return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

# class GetAllRequestsVeiw(APIView):
#     def get(self, request, *args, **kwargs):
#         category = request.query_params.get("category", None)
#         rtype = request.query_params.get("type", None)
#         name = request.query_params.get("search", None)
#         price = request.query_params.get("price", None)
#         queryset = Request.objects.all().order_by("-PostDate")
#         queryset = queryset.filter(Approve=True, Status="Open", Decline=False)
#         if category:
#             queryset = queryset.filter(Category__icontains=category)
#         if rtype:
#             queryset = queryset.filter(Type__icontains =  rtype)
#         if price:
#             try:
#                 queryset = queryset.filter(Budget__lte=int(price))
#             except:
#                 return Response({"MSG" : "Invalid Number"} , status=status.HTTP_400_BAD_REQUEST)
#         if name:
#             queryset1 = list( queryset.filter(Topic__icontains = name) )
#             result=[]
#             for req in queryset:
#                 if Request_Skill.objects.filter(RequestID = req.pk , skill__icontains=name).exists():
#                     result.append(req)
#             queryset = list(set(result + queryset1))
        
#         paginator = CustomPagination()
#         page = paginator.paginate_queryset(queryset, request)
#         if page is not None:
#             res = self.get_requests_with_offers(page)
#             return paginator.get_paginated_response(res)
#         res = self.get_requests_with_offers(queryset)
#         return Response({"requests": res  }, status=status.HTTP_200_OK)

#     def get_requests_with_offers(self, requests):
#         res = []
#         for req in requests:
#             offers = Offer.objects.filter(RequestID=req.id)
#             no_of_offers = offers.count()

#             get_request_serializer = GetRequestSerializer(req)
#             offer_serializer = OfferSerializer(offers, many=True)

#             new_req = {
#                 "request": get_request_serializer.data,
#                 "numberofOffers": no_of_offers,
#                 "Offers": offer_serializer.data,
#                 "UserName":req.UserID.Fname + " " +req.UserID.Lname ,
#             }
#             res.append(new_req)
#         return res

# class GetRequestVeiw(APIView):
#     def get(self, request, reqid):
#         try:
#             request_instance = Request.objects.get(pk=reqid)
#         except Request.DoesNotExist:
#             return Response({"MSG": "Invalid request"}, status=status.HTTP_404_NOT_FOUND)
#         try:
#             offers = Offer.objects.filter(RequestID=reqid)
#         except Offer.DoesNotExist:
#             offers = []
#         try:
#             userid= request.headers['UserID']
#         except:
#             userid =None
        
#         Skills = Request_Skill.objects.filter(RequestID = reqid)
#         requestSkillSerializer=RequestSkillSerializer(Skills , many = True)
#         no_of_offers = offers.count()
#         offers = Offer.objects.filter(RequestID=request_instance.id)
#         AVGOffers = offers.aggregate(Avg("Price"))["Price__avg"]
#         if not AVGOffers :
#             AVGOffers = 0
#         MyOffer=[]
#         HASOFFER=False
#         CANADDOFFERS=False
#         if userid :
#             try:
#                 MyOffer =offers.get(UserID=userid)
#                 MyOffers=OfferSerializer(MyOffer , many = False)
#                 MyOffer =[ MyOffers.data]
#                 HASOFFER=True
#             except:
#                 CANADDOFFERS=True
#                 MyOffer=[]
#         else:
#             MyOffer=[] 
#         get_request_serializer = GetRequestSerializer(request_instance, many=False)
#         ReqOwner = User.objects.get (pk = request_instance.UserID.pk)
#         OwnerProfile = ProfileSerializer(ReqOwner , many = False)
#         return Response({
#             "request":  get_request_serializer.data ,
#             "HASOFFER":HASOFFER ,
#               "AVGOffers":AVGOffers,
#             "OwnerProfile":OwnerProfile.data, 
#             "MyOffer":MyOffer , 
#             "numberofOffers": no_of_offers, 
#             "CanAddOffer":CANADDOFFERS,
#             "Skills":requestSkillSerializer.data
#             }, status=status.HTTP_200_OK)

# class GetRequestsForUser(APIView):
#     def get(self, request, userid):
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         decline = request.query_params.get("decline", None)
#         Approve = request.query_params.get("Approve", None)
#         Status = request.query_params.get("status", None)
#         queryset = Request.objects.filter(UserID=userid).order_by("-PostDate")
#         if not decline and not Approve and not Status:
#             queryset = queryset.filter(Status="Open")
#         if decline:
#             if decline == "True":
#                 queryset = queryset.filter(Decline=True)
#             elif decline == "False":
#                 queryset = queryset.filter(Decline=False)
#         if Approve:
#             if Approve == "True":
#                 queryset = queryset.filter(Approve=True)
#             elif Approve == "False":
#                 queryset = queryset.filter(Approve=False)
#         if Status:
#             if Status == "NF":
#                 queryset = queryset.exclude(Status="Finish")
#             else:
#                 queryset = queryset.filter(Status=Status)
#         try:
#             dbrequsts = list(queryset)
#             res = []
#             for req in dbrequsts:
#                 try:
#                     offers = list(Offer.objects.filter(RequestID=req.id , Decline = False))
#                 except:
#                     offers = list([])
#                 noOfoffers = len(offers)
#                 Accres=None
#                 try:
#                     AcceptedOFFER = Offer.objects.get(RequestID=req.id , Decline = False , State=True)
#                     Accres = AcceptedOFFER.UserID.pk
#                 except:
#                     Accres=None
#                 OFS = []
#                 if noOfoffers > 0:
#                     for offer in offers:
#                         offerUser = User.objects.get(pk=offer.UserID.pk)
#                         OfferUserS = ProfileSerializer(offerUser)
#                         offerSerializer = OfferSerializer(offer, many=False)
#                         OFS.append(
#                             {
#                                 "offer": {
#                                     "details": offerSerializer.data,
#                                     "user": OfferUserS.data,
#                                 }
#                             }
#                         )
#                 getRequestSerializer = GetRequestSerializer(req, many=False)
#                 newreq = {
#                     "request": getRequestSerializer.data,
#                     "numberofOffers": noOfoffers,
#                     "Offers": OFS,
#                     "AcceptedOffer":Accres
#                 }
#                 res.append(newreq)
#             return Response({"requests": res}, status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

# class AcceptRequst(APIView):
#     def post(self, request, userid, requestid):  # check for admin and jwtauth
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         dbuser = User.objects.get(pk=userid)
#         if not dbuser.is_superuser: 
#             return Response({"MSG": "Admins Only"}, status=status.HTTP_401_UNAUTHORIZED)
#         try:
#             dbrequest = Request.objects.get(pk=requestid)
#             dbrequest.Approve = True
#             dbrequest.save()
#             sendMSG(dbrequest.UserID.email , f"The request {dbrequest.Topic} Is Approved By Xperinced.")
#             return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
#         except:
#             return Response(
#                 {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
#             )

# class DeclineRequest(APIView):
#     def post(self, request, userid, requestid):  # check for admin and jwtauth
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         dbuser = User.objects.get(pk=userid)
#         if not dbuser.is_superuser:
#             return Response({"MSG": "Admins Only"}, status=status.HTTP_401_UNAUTHORIZED)
#         try:
#             dbrequest = Request.objects.get(pk=requestid )
#             dbrequest.Decline = True
#             dbrequest.UserID.pendingbalance -=float(dbrequest.Budget )
#             dbrequest.UserID.balance +=float (dbrequest.Budget )
#             try:
#                 dbrequest.DeclineReason = request.data['reason']
#             except:
#                 return Response({"MSG" : "Where Is reason"} , status=status.HTTP_400_BAD_REQUEST)
#             newTransaction={
#                 "RequestID":dbrequest.pk
#                 ,"Title":F" Now We transfer {float( dbrequest.Budget)} EGP from your bending Balance To Available Balance" ,
#                 "amount":float(dbrequest.Budget)
#             }
#             AddRequestTransactionSerializar =AddRequestTransactionSerializars(data = newTransaction)
#             if AddRequestTransactionSerializar.is_valid():
#                 AddRequestTransactionSerializar.save()
#                 dbrequest.UserID.save()
#                 dbrequest.save()
#                 sendMSG(dbrequest.UserID.email, f"Your request {dbrequest.Topic} Is Declined.")
#                 return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
#         except:
#             return Response(
#                 {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
#             )

# class FinishRequest(APIView):
#     def post(self , request , userid , requestid):
#         if not JWTAuth(request , userid):
#             return Response({"MSg" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try:
#             dbrequest=Request.objects.get(pk = requestid , UserID=userid)
#             rating = request.data['rating']
#             INSID=request.data['InsID']
#             newRating = {
#                 "InsID":INSID,
#                 "UserID":userid,
#                 "requestID":requestid,
#                 "rating":int(rating),
#             }
#             if dbrequest:
#                 RatingSerializar=RatingSerializars(data=newRating)
#                 if RatingSerializar.is_valid():
#                     try:
#                         INSBalance = User.objects.get(pk = INSID)
#                         INSOFFER = Offer.objects.get(RequestID = requestid , State=True)
#                         INSBalance.profit += 0.8*INSOFFER.Price
#                         UserBalance =  User.objects.get(pk = userid)
#                         UserBalance.pendingbalance -= INSOFFER.Price
#                         dbrequest.Status='Finish'
#                         # ins , user => user amunt(10) , 8
#                         newtransaction = {
#                             "RequestID" : dbrequest.pk , 
#                             'Title' : F"Finish Request With {INSOFFER.Price} EGP",
#                             "amount" : INSOFFER.Price ,
#                             "OfferID":INSOFFER.pk 
#                         }
#                         FinishRequestTransactionSerializar = FinishRequestTransactionSerializars(data = newtransaction )
#                         if FinishRequestTransactionSerializar.is_valid():
#                             Finstace = FinishRequestTransactionSerializar.save()
#                             newRevenue = {
#                                 "TransID":Finstace.pk , 
#                                 "amount" : 0.2*INSOFFER.Price
#                             }
#                             revenueTransactionSerializar = revenueTransactionSerializars(data = newRevenue)
#                             if revenueTransactionSerializar.is_valid():
#                                 revinstance =revenueTransactionSerializar.save()
#                                 UserBalance.save()
#                                 INSBalance.save()
#                                 RatingSerializar.save()
#                                 dbrequest.save()
#                                 sendMSG(INSBalance.email , f"The request {dbrequest.Topic} concluded at a price of {INSOFFER.Price} EGP, with a deduction of {0.2*INSOFFER.Price} EGP, resulting in a net profit of {0.8*INSOFFER.Price} EGP.")
#                                 sendMSG(UserBalance.email , f"The request {dbrequest.Topic}  concluded at a price of {INSOFFER.Price} EGP.")
#                                 return Response({"MSG":"Done"} , status=status.HTTP_200_OK)
#                             else:
#                                 revinstance.delete()
#                                 Finstace.delete()
#                                 return Response({"MSG":"Error"} , status=status.HTTP_400_BAD_REQUEST)
#                         return Response({"MSG":"Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)

#                     except:
#                         return Response({"MSG":"Invalid Request "} , status=status.HTTP_400_BAD_REQUEST) 
#             else:
#                 return Response({"MSG":"Invalid Request "} , status=status.HTTP_400_BAD_REQUEST)
#         except:
#             return Response({"MSG":"Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)

# # Offer --> Need Testing

# class AddOfferView(APIView):
#     def post( self , request ):
#         try:
#             userid = request.data["UserID"]
#         except:
#             return Response(
#                 {"MSG": "Where Is UserID feild"}, status=status.HTTP_400_BAD_REQUEST
#             )
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             newreq = {
#                 "Offerdesc": request.data["Offerdesc"],
#                 "Price": request.data["Price"],
#                 "UserID": request.data["UserID"],
#                 "RequestID": request.data["RequestID"],
#             }           
#             addOfferSerializer = AddOfferSerializer(data=newreq)
#             if addOfferSerializer.is_valid():
#                 addOfferSerializer.save()
#             else:
#                 return Response(
#                     {
#                         "MSG": "Invalid Data"
#                     }, status=status.HTTP_400_BAD_REQUEST
#                 )
#             return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

# class GetOffersForUser(APIView):
#     def get(self, request, userid):
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             state = request.query_params.get("state", None)
#             decline = request.query_params.get("decline", None)
#             queryset = Offer.objects.filter(UserID=userid).order_by("-PostDate")
#             if decline:
#                 if decline == "True":
#                     queryset = queryset.filter(Decline=True)
#                 elif decline == "False":
#                     queryset = queryset.filter(Decline=False)
#             if state:
#                 if state == "True":
#                     queryset = queryset.filter(State=True)
#                 elif state == "False":
#                     queryset = queryset.filter(State=False)
#             dbOffers = queryset
#             res = []
#             if dbOffers is not None:
#                 for offer in dbOffers:
#                     req = Request.objects.get(pk=offer.RequestID.pk)
#                     requestserializer = GetRequestSerializer(req, many=False)
#                     addOfferSerializer = AddOfferSerializer(offer, many=False)
#                     res.append(
#                         {
#                             "Offer": addOfferSerializer.data,
#                             "Request": requestserializer.data,
#                         }
#                     )
#             return Response({"Offers": res}, status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

# class AcceptOffer(APIView):
#     def post(self, request, userid, offerid):  # check for admin and jwtauth
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             USERBalance = User.objects.get(pk=userid)
#             dboffer = Offer.objects.get(pk=offerid)
#             dboffer.State = True
#             dbrequest = Request.objects.get(pk=str(request.data["RequestID"]) , UserID = userid)
#             print(dbrequest)
#             dbrequest.Status = "Ongoing"
#             reqprice = float( dbrequest.Budget )
#             if dboffer.Price > reqprice :
#                 if USERBalance.balance < (dboffer.Price  - reqprice ):
#                     return Response ({"MSG" : "Charge First"} , status= status.HTTP_400_BAD_REQUEST)
#                 else:
#                     USERBalance.balance -= (dboffer.Price - reqprice)
#                     USERBalance.pendingbalance += (dboffer.Price - reqprice)
#             elif  dboffer.Price <reqprice :
#                 USERBalance.balance += ( -dboffer.Price + float(reqprice))
#                 USERBalance.pendingbalance -= ( -dboffer.Price +reqprice)
#             dboffer.save()
#             dbrequest.save()
#             USERBalance.save()
#             sendMSG(dboffer.UserID.email , F"Your Offer of request {dbrequest.Topic} Is Approved")
#             try:
#                 dboffers = Offer.objects.filter(RequestID = dbrequest.pk , State = False)
#                 for offer in dboffers:
#                     offer.Decline = True
#                     offer.save()
#             except:
#                 pass 
#             return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
#         except:
#             return Response(
#                 {"MSG": "Invalid Request"}, status=status.HTTP_400_BAD_REQUEST
#             )

# class DeclineOffer(APIView):
#     def delete(self, request, userid, offerid):  # check for admin and jwtauth
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             dbuser = User.objects.get(pk=userid)
#             dbOffer = Offer.objects.get(pk=offerid)
#             dbOffer.Decline = True
#             dbOffer.save()
#             return Response({"MSG": "Done ya Bro"}, status=status.HTTP_200_OK)
#         except:
#             return Response(
#                 {"MSG": "Invalid  Request"}, status=status.HTTP_400_BAD_REQUEST
#             )

# class DeleteOffer(APIView):
#     def delete(self , request , userid , offerid):
#         if not JWTAuth(request , userid):
#             return Response({"MSG": " Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try : 
#             offer = Offer.objects.get(pk = offerid , UserID=userid)
#             if offer.RequestID.Status=="Ongoing" and offer.State == True:
#                 return Response ({"MSG" : "You Can't Remove This Offer"} , status= status.HTTP_400_BAD_REQUEST)
#             elif offer.RequestID.Status=="Finish" and offer.State == True:
#                 return Response ({"MSG" : "You Can't Remove This Offer"} , status= status.HTTP_400_BAD_REQUEST)
#             offer.delete()
#             return Response({"MSG":"Done"} , status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG":"Invalid Data "} , status=status.HTTP_400_BAD_REQUEST)
# # Chat System

# class SendMessage(APIView):
#     def post(self, request, userid, requestid):
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             dboffer = Offer.objects.get( RequestID = requestid , State = True)
#             dbrequest = Request.objects.get(pk = requestid)
#             if str(dbrequest.UserID.pk) != str(userid) and str(dboffer.UserID.pk)  != str( userid ):
#                 return Response({"MSG" : "unauthorized"} , status= status.HTTP_401_UNAUTHORIZED)
#         except:
#             return Response({"MSG" : "Invalid Data "} , status= status.HTTP_400_BAD_REQUEST)
#         try:
#             Content = request.data["content"]
#             NewMessage = {
#                 "sender": userid,
#                 "Content": Content,
#                 "request": requestid,
#             }
#             MessageS = Messageserializers(data=NewMessage)
#             if MessageS.is_valid():
#                 MessageS.save()
#                 return Response({"MSG": "Done"}, status=status.HTTP_200_OK)
#             return Response(
#                 {"MSG": "Invaild Data Bro I Want  to Fuck Nabeh  "},
#                 status=status.HTTP_200_OK,
#             )
#         except:
#             return Response({"MSG": "Invalid Data"}, status=status.HTTP_400_BAD_REQUEST)

# class GetChat(APIView):
#     def get( self , request , requestid ,userid):
#         if not JWTAuth(request, userid):
#             return Response(
#                 {"MSG": "Invalid Token "}, status=status.HTTP_401_UNAUTHORIZED
#             )
#         try:
#             dbrequest = Request.objects.get(pk = requestid)
#             dboffer = Offer.objects.get(RequestID =requestid , State = True )
#             if userid != str(dbrequest.UserID.pk) and userid != str(dboffer.UserID.pk):
#                 return Response({"MSG" : "UNAUTHORIZED"} ,status= status.HTTP_401_UNAUTHORIZED)
#             AllMessage = list(
#                 Message.objects.filter(request=requestid).order_by('-date')
#             )
#             res=[]            
#             requestOwnerProfile = ProfileSerializer(dbrequest.UserID , many = False)
#             OfferOwnerProfile = ProfileSerializer(dboffer.UserID , many = False)
#             ress ={
                    
#                     "request":GetRequestSerializer(dbrequest , many = False).data,
#                     "Offer": OfferSerializer(dboffer , many =False).data ,
#                 }
#             if(requestOwnerProfile.data['id'] == str(userid)):
#                 ress["ContactProfile"] =OfferOwnerProfile.data 
#                 ress['RoleInchat'] = 'RequestOwner'
#             if (OfferOwnerProfile.data['id'] == str(userid)):
#                 ress["ContactProfile"] =requestOwnerProfile.data 
#                 ress['RoleInchat'] = 'OfferOwner'
                
#             for message in AllMessage:
#                 AllMessageS = Messageserializers(message, many=False)
#                 sender = User.objects.get(pk=message.sender.pk)
#                 senderS = ProfileSerializer(sender, many=False)
#                 res.append({
#                     "message":AllMessageS.data,
#                     "sender":senderS.data,
#                 })
#             ress['messages']=res
#             return Response(ress,status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG": "Fuck Nabeh"}, status=status.HTTP_200_OK)
        
# #Support API 

# class SendComplaint(APIView):
#     def post(self , request):
#         try:
#             message = request.data['message']
#             email = request.data['email']
#             phone = request.data['phone']
#             newproblem = {
#                 "email": email,
#                 "phone": phone , 
#                 "message" : message,
#                 "Type":"User Complanet"
#             }
#             problemserializers=AddProblemserializers(data= newproblem)
#             print(problemserializers.error_messages)
#             if problemserializers.is_valid():
#                 problemserializers.save()
#                 return Response({"MSG":"Done"} , status= status.HTTP_200_OK)
#             else:
#                 return Response({"MSG":problemserializers.error_messages} , status= status.HTTP_400_BAD_REQUEST)
#         except:
#             return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)

# class RequestComplaint(APIView):
#     def post(self , request):
#         try:
#             message = request.data['message']
#             requestID = request.data['requestID']
#             UserID = request.data['UserID']
#             if not JWTAuth(request , UserID):
#                 return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#             dbUser = User.objects.get(pk = UserID)
#             dbrequest = Request.objects.get(pk = requestID)
#             email = dbUser.email
#             phone = dbUser.phone
#             newproblem = {
#                 "email":email,
#                 "phone":phone , 
#                 "message" : message , 
#                 "request" : dbrequest.pk
#             }
#             problemserializers=Problemserializers(data= newproblem)
#             if problemserializers.is_valid():
#                 problemserializers.save()
#                 return Response({"MSG":"Done"} , status= status.HTTP_200_OK)
#             else:
#                 return Response({"MSG":"Fuck Khalid"} , status= status.HTTP_400_BAD_REQUEST)
                
#         except:
#             return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)

# class GetAllComplaint(APIView):
#     def get(self  , request , adminid):
#         if not JWTAuth(request , adminid):
#             return Response({ "MSG" : "Invalid Token" } , status= status.HTTP_401_UNAUTHORIZED)
#         dbAdmin = User.objects.get(pk = adminid )
#         if not dbAdmin.is_superuser:
#             return Response({"MSG" : "Invalid Role"}  , status=status.HTTP_401_UNAUTHORIZED)
#         try:
#             AllComplaint = Complaint.objects.filter( seen = False)
#             Problemserializer = Problemserializers(AllComplaint, many = True)
#             return Response({"complaints":Problemserializer.data} , status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG":"Invaild Data"} , status=status.HTTP_400_BAD_REQUEST)
        
# class ReplyComlaint(APIView):
#     def post(self , request , adminid , complaintid):
#         try:
#             if not JWTAuth(request , adminid):
#                 return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#             try :
#                 dbuser = User.objects.get(pk = adminid)
#                 if not dbuser.is_superuser:
#                     return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED)
#             except:
#                 return Response ({"MSG" : " INVALID USER"} , status=status.HTTP_401_UNAUTHORIZED)
#             try:
#                 response = request.data['response']
#             except :
#                 return Response ({"MSG" : "Invalid Response"} , status= status.HTTP_400_BAD_REQUEST)
#             try:
#                 dbcomplaint = Complaint.objects.get(pk = complaintid)
#             except:
#                 return Response({"MSG": "Invalid Complaint ID"} , status=status.HTTP_400_BAD_REQUEST)
#             sendMSG(dbcomplaint.email , f"Hello ,{response}")
#             dbcomplaint.seen=True
#             dbcomplaint.save()
#             return Response({"MSG" : "Done"} , status=status.HTTP_200_OK )
#         except:
#             return Response({"MSG":"Server Error"} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)                    
            
# def GetOngingRequests(Qset):
#     try:
#         queryset = Qset.filter(Status = 'OnGoing')
#         requestSerializer = GetRequestSerializer(queryset , many = True)
#         queryset = [requestSerializer.data]
#     except:
#         queryset = []
#     return queryset

# def GetFinishRequests(Qset):
#     ress=[]
#     try:
#         try:
#             queryset = Qset.filter(Status = 'Finish')
#         except:
#             queryset=[]
#         for req in queryset :
#             dboffer = Offer.objects.get(RequestID = req.pk , State = True)
#             requestSerializer = GetRequestSerializer(req , many = False)
#             offerSerializer = OfferSerializer(dboffer , many = False)
#             ress.append
#             (
#                 {
#                     "request": requestSerializer.data,
#                     "Offer":offerSerializer.data
#                 }
#             )
#     except:
#         ress = []
#     return ress

# def GetWatingForApproveRequests(Qset):
#     ress = []
#     try:
#         queryset = Qset.filter(Approve = False , Decline = False)
#     except:
#         queryset = []
#     try : 
#         for req in queryset:
#             dbUser = User.objects.get(pk = req.UserID.pk)
#             requestSerializer = GetRequestSerializer(req , many = False)
#             userSerializer = ProfileSerializer(dbUser , many = False)
#             ress.append({
#                 "request":requestSerializer.data , 
#                 "Owner" : userSerializer.data
#             })
#     except : 
#         ress =[]
#     return ress

# def GetAllComplaints():
#     try:
#         allcomp= Complaint.objects.filter(seen = False)
#         allcompS = Problemserializers(allcomp , many = True)
#         return allcompS.data
#     except :
#         return []

# def GetAllAdmins():
#     Admins = User.objects.filter(is_superuser = True)
#     Admins_s = ProfileSerializer(Admins , many = True)
#     return Admins_s.data
    
# def GetAllTransactions():
#     pass


# class GetPindingRequests(APIView):
#     def get (self , request , adminid):
#         if not JWTAuth(request , adminid):
#             return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try:
#             try:
#                 dbuser = User.objects.get(pk = adminid)
#             except:
#                 return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED) 
#             if not dbuser.is_superuser:
#                 return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED)
#             try:
#                 queryset = Request.objects.all()
#                 queryset = GetWatingForApproveRequests(queryset)
#             except:
#                 queryset=[] 
#             return Response({"requests" : queryset} , status= status.HTTP_200_OK)
#         except:
#             return Response({"MSG" : "Error"} , status= status.HTTP_400_BAD_REQUEST)
         

# class GetAdminHomePageVeiw(APIView):
#     def get(self , request , userid):
#         if not JWTAuth(request , userid):
#             return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try:
#             dbAdmin = User.objects.get(pk = userid)
#         except:
#             dbAdmin =None
#         if dbAdmin is None or not dbAdmin.is_superuser:
#             return Response ({"MSG":"UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)
        
#         res={}
#         #getrevenuee
#         try:
#             all_revenue_amounts = revenue.objects.aggregate(total_amount=Sum('amount'))
#         except:
#             all_revenue_amounts = 0.0 
#         res['Revenu'] = all_revenue_amounts
        
#         #get All Requests
#         try:
#             allrequests = Request.objects.all()
#         except:
#             allrequests = []
#         try:
#             allrequestsSerializar = GetRequestSerializer(allrequests , many = True)
#             res['AllRequests'] = allrequestsSerializar.data
#         except:
#             res['AllRequests'] = []

#         #number Of All Requests 
#         NoOfRequests = len(allrequests)
#         res['NumberOfAllRequest'] = NoOfRequests
        
#         #Get All Pending Requests
#         try :
#             allPendingRequests = Request.objects.filter(Approve = False , Decline = False).order_by('-PostDate')[:3]
#         except:
#             allPendingRequests = []
#         try:
#             allPendingRequestsSerializar = GetRequestSerializer(allPendingRequests , many = True)
#             res['AllPendingRequests'] = allPendingRequestsSerializar.data
#         except:
#             res['AllPendingRequests'] = []

#         #Number Of All Pending Requests
#         try:
#             NoOfAllPendingRequests =len(Request.objects.filter(Approve = False , Decline = False))
#             res['NumberOfAllPendingRequests']=NoOfAllPendingRequests
#         except:
#             res['NumberOfAllPendingRequests'] = 0
#         # Get All Complaints
#         try:
#             allcomplaints = Complaint.objects.all()
#         except:
#             allcomplaints = []
            
#         try:
#             AllComplaintSerializars = Problemserializers(allcomplaints , many = True)
#             res['AllComplaints']=AllComplaintSerializars.data
#         except:
#             res['AllComplaints']=[]

#         #Number Of All Complaints
#         NoAllComplaints = len(allcomplaints)
#         res['NumberOfAllComplaints'] = NoAllComplaints
#         #Get All Pending Complaints
#         try:
#             AllPendingComlplaints = Complaint.objects.filter(seen = False)
#         except:
#             AllPendingComlplaints = []
        
#         try:
#             AllPendingComlplaintsSerializars = Problemserializers(AllPendingComlplaints , many = True)
#             res['AllPendingComplaints'] = AllPendingComlplaintsSerializars.data
#         except:
#             res['AllPendingComplaints'] =[]
            
#         #Number Of All pending Complaints
#         NoAllComplaints = len(AllPendingComlplaints)
#         res['NumberOfAllPendingComplaints'] = NoOfAllPendingRequests
#         #Get All Admins
#         try:
#             AllAdmins = User.objects.filter(is_superuser =True)
#         except:
#             AllAdmins =[]
        
#         try:
#             NoAllUsers = User.objects.all().count()
#             res['NumberOfAllUsers']=NoAllUsers
#         except:
#             res['NumberOfAllUsers']=0

#         try:
#             AllAdminsSerializars = ProfileSerializer(AllAdmins  , many = True)
#             res['AllAdmins']=AllAdminsSerializars.data
#         except:
#             res['AllAdmins'] = []
        
#         try:
#             AllpendingTransacctions = RequestTransaction.objects.filter(Approve = False , RequestID__isnull=False , OfferID__isnull = False)
#             AllpendingTransacctionsSerializers = AllTransactionsSerializars(AllpendingTransacctions , many = True)
#             res['AllPendingTransactions'] = AllpendingTransacctionsSerializers.data
#             res["NumberOfAllPendingTransactions"] = len(AllpendingTransacctions)
#         except:
#             res['AllPendingTransactions'] =[]
#             res["NumberOfAllPendingTransactions"] = 0
            
#         try:
#             now = timezone.now()
#             one_week_ago = now - timedelta(days=7)
#             latest_registers_past_week = User.objects.filter(date_joined__gte=one_week_ago).order_by('-date_joined').count()
#             res['NumberOflatestregisters'] = latest_registers_past_week
#         except:
#             res["NumberOflatestregisters"] = 0
#         return Response(res , status=status.HTTP_200_OK)
 

# class GetRevenueForAdminView(APIView):
#     def get(self , request ,userid):
#         if not JWTAuth(request , userid):
#             return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try:
#             dbAdmin = User.objects.get(pk = userid)
#         except:
#             dbAdmin =None
#         if dbAdmin is None or not dbAdmin.is_superuser:
#             return Response ({"MSG":"UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)
        
#         res={}
#         try:
#             AllpendingTransacctions = RequestTransaction.objects.filter(Approve = False , RequestID__isnull=False , OfferID__isnull = False)
#             AllpendingTransacctionsSerializers = AllTransactionsSerializars(AllpendingTransacctions , many = True)
#             res['AllPendingTransactions'] = AllpendingTransacctionsSerializers.data
#             res["NumberOfAllPendingTransactions"] = len(AllpendingTransacctions)
#         except:
#             res['AllPendingTransactions'] =[]
#             res["NumberOfAllPendingTransactions"] = 0
#         try:
#             alltrans=[]
#             try:
#                 allRevenueTransactions = revenue.objects.all()
#             except:
#                 allRevenueTransactions = []

#             for trans in allRevenueTransactions :
#                 allRevenueTransactionsSerializars = AllTransactionsSerializars(trans.TransID , many = False)
#                 alltrans.append({
#                     "Transactions":allRevenueTransactionsSerializars.data
#                 })
#         except:
#             return Response({"MSG" : "Server Error"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)
#         return Response({"RevenueTransactions" :alltrans , "PendingTransactions" :res} , status=status.HTTP_200_OK)       
    

# stripe.api_key = settings.STRIPE_SECRET_KEY        

# class GetBalanceAndTransactions(APIView):
#     def get (self , request , userid):
#         if not JWTAuth(request , userid):
#             return Response({"MSG":"Invalid Token"} , status=status.HTTP_401_UNAUTHORIZED)
#         try : 
#             try:
#                 transactions = (RequestTransaction.objects.all())
#                 WCharge = (ChargeAndWithdrow.objects.filter(UserID = userid))
#             except:
#                 transactions=[]
#                 WCharge=[]
#             respon =[]
#             for trans in transactions:
#                 if trans.RequestID and  str(trans.RequestID.UserID.pk) == str(userid) :
#                     alltransactionsS = AllTransactionsSerializars( trans , many = False)
#                     respon.append({
#                         "Transaction":alltransactionsS.data
#                         })
#                 if trans.OfferID and  str(trans.OfferID.UserID.id) == str(userid):
#                     alltransactionsSerializar = AllTransactionsSerializars(trans , many = False)
#                     respon.append({"Transaction":alltransactionsSerializar.data})
#             for trans in WCharge:
#                 GetChargeAndWithdrowTransactionSerializer = GetChargeAndWithdrowTransactionSerializers(trans , many = False)
#                 respon.append({"Transaction" : GetChargeAndWithdrowTransactionSerializer.data})
#             UserBalance = User.objects.get(pk = userid)
#             UserBalanceSerializar = GetBalanceSerializars(UserBalance , many = False)
#             return Response( {
#                 "Transactions" :respon , 
#                 "Balance" :UserBalanceSerializar.data
#                 } , status = status.HTTP_200_OK)
#         except:
#             return Response ({"MSG" : "Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)
            
# class AcceptTransaction(APIView):
#     def post(self , request , transactionID , userid):
#         if not JWTAuth(request , userid ):
#             return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         Role = User.objects.get(pk = userid)
#         if not Role.is_superuser :
#             return Response({"MSG" : "UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)        
#         try:
#             trans = RequestTransaction.objects.get(pk = transactionID)
#             dbRequest = trans.RequestID
#             Offerr=Offer.objects.get(RequestID = dbRequest.pk , State = True)
#             transamunt = 0.8*trans.amount
#             OfferOwnerBalance = User.objects.get(pk = Offerr.UserID.pk)
#             OfferOwnerBalance.balance += transamunt
#             OfferOwnerBalance.profit -= transamunt
#             sendMSG(OfferOwnerBalance.email , f"Profit from request {dbRequest.Topic} has been transfered to your balance")
#             trans.Approve=True
#             trans.save()
#             OfferOwnerBalance.save()
#             return Response({"MSg":"DONNEEEE"} , status= status.HTTP_200_OK)
#         except:
#             return Response({"MSG":"Invalid Data"} , status= status.HTTP_400_BAD_REQUEST)
      
# class PaymentAPI(APIView):
#     def post(self, request, userid):
#         if not JWTAuth(request, userid):
#             return Response({"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED)
#         try:
#             amount = int(request.data.get('amount', 0))
#             if amount < 50  :
#                 raise ValueError("Invalid amount Miniumum amount Must Be 50.0 EGP")
#         except (ValueError):
#             return Response({"MSG": ValueError}, status=status.HTTP_400_BAD_REQUEST)
#         except TypeError:
#             return Response({"MSG": ValueError}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             checkout_session = stripe.checkout.Session.create(
#                 payment_method_types=['card'],
#                 line_items=[
#                     {
#                         'price_data': {
#                             'currency': 'egp',
#                             'product_data': {
#                                 'name': 'Charge Your Balance',
#                             },
#                             'unit_amount': int(amount * 100),  # Ensure amount is in the smallest currency unit
#                         },
#                         'quantity': 1,
#                     },
#                 ],
#                 mode='payment',
#                 success_url=f"http://127.0.0.1:8000/api/updatebalance/{str(amount).split('.')[0]}/{str(userid)}",
#                 cancel_url=f"http://127.0.0.1:8000/api/failtransaction/{str(amount).split('.')[0]}/{str(userid)}",
#             )
#             return Response({"url": checkout_session.url}, status=status.HTTP_200_OK)
#         except stripe.error.StripeError as e:
#             return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
#         except Exception as e:
#             return Response(
#                 {'error': 'Something went wrong when creating Stripe Checkout session'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class UpdateBalance(APIView):
#     def get(self , request , amount , userid):
#         Userb = User.objects.get(pk = userid)
#         Userb.balance += float(amount)
#         newTransaction = {
#             'amount':float(amount),
#             'Title':F"You have charged {float(amount)} EGP to your balance",
#             'UserID':userid,
#             "Type":f"Charge",
#             "Successfull":True
#         }
#         print(newTransaction)
#         AddChargeAndWithdrowTransactionSerializer = AddChargeAndWithdrowTransactionSerializers(data = newTransaction)
#         if AddChargeAndWithdrowTransactionSerializer.is_valid():
#             AddChargeAndWithdrowTransactionSerializer.save()
#             Userb.save()    
#             return redirect('http://localhost:3000/balance' , status.HTTP_200_OK)

# class FalidTransaction(APIView):
#     def get(self , request , userid ,amount):
#         newTransaction = {
#             'amount':float(amount),
#             'Title':F"Your charge {float(amount)} EGP has faild",
#             'UserID':userid,
#             "Type":f'Charge',
#             "Successfull":False
#         }
#         AddChargeAndWithdrowTransactionSerializer = AddChargeAndWithdrowTransactionSerializers(data = newTransaction)
#         if AddChargeAndWithdrowTransactionSerializer.is_valid():
#             AddChargeAndWithdrowTransactionSerializer.save()
#         return Response({"MSG" : "Error"} , status= status.HTTP_400_BAD_REQUEST)
    
# class withdraw(APIView):
#     def post(self , request , userid):
#         if not JWTAuth(request , userid):
#             return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
#         try:
#             print(request.data)
#             amount = float (request.data['amount'])
#             Userbalance  = User.objects.get(pk = userid)
#             if Userbalance.balance >=float(amount) :
#                 Userbalance.balance -= float(amount)
#             else:
#                 return Response({"MSG" : f"Your Balance Is Less Than {float(amount)} EGP"} , status=status.HTTP_400_BAD_REQUEST)
#             newTransaction = {
#                 'amount':float(amount),
#                 'Title':F"You have withdrawn {float(amount)} EGP from your balance",
#                 'UserID':userid , 
#                 "Type":"withdraw",
#                 "Successfull":True
#             }
#             AddChargeAndWithdrowTransactionSerializer = AddChargeAndWithdrowTransactionSerializers(data = newTransaction)
#             if AddChargeAndWithdrowTransactionSerializer.is_valid():
#                 AddChargeAndWithdrowTransactionSerializer.save()
#                 Userbalance.save()
#                 return Response({"MSG" : "Done"} , status= status.HTTP_200_OK)
#             else:
#                 return Response({"MSG" : "Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)
#         except:
#             return Response({"MSG" : "Invalid Data"} , status=status.HTTP_400_BAD_REQUEST)
        
# def GenerateOTP():
#     digits = string.digits
#     otp = ''.join(random.choice(digits) for _ in range(4))
#     return otp

# class GetOTP( APIView ):
#     def post(self , request):
#         try:
#             try:
#                 useremail = User.objects.get(email = request.data['email'])
#             except:
#                 useremail = None
#             try:
#                 userOTP = OTP.objects.get(UserID = str(useremail.pk))
#             except:
#                 userOTP =None            
#             if userOTP is not None:
#                 userOTP.delete()
#             if not useremail :
#                 return Response({"MSG" : "Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
#             NewOtp = GenerateOTP()
#             NewOTPinstance ={
#                 "OTP" : NewOtp ,
#                 "UserID": useremail.pk,
#             }
#             GetOTPSerializar = GetOTPSerializars(data = NewOTPinstance)
#             if GetOTPSerializar.is_valid():
#                 GetOTPSerializar.save()
#                 sendMSG(useremail.email , f" Your OTP IS : {NewOtp}")
#                 return Response({"MSG" : "Done" , "email": useremail.email} , status= status.HTTP_200_OK)       
#             return Response({"MSG" : "Invalid Data"} , status= status.HTTP_200_OK)        
#         except:
#             return Response({"MSG" : "Error  in server"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)        
        
# class VerifyOTP( APIView ):
#     def post(self ,request):
#         try:
#             try:
#                 Useremail = User.objects.get(email = request.data["email"])
#             except:
#                 return Response({"MSG" : "Email Does not exist"} , status= status.HTTP_400_BAD_REQUEST)
            
#             if 'X-hX-P--d--d--d--dx-xx--o' not in request.headers or not Useremail or  request.headers['X-hX-P--d--d--d--dx-xx--o'] !='__cssAschrcm_r_r__erwx$$d2A_$mr__I_@br_a_hi__m_Xp_p':
#                 return Response({"MSG" :"Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
#             try:
#                 UserOTPV = OTP.objects.get(OTP = request.data['OTP'] , UserID = Useremail.pk) 
#             except:
#                 return Response({"MSG" : "incorect OTP"} , status= status.HTTP_400_BAD_REQUEST)
#             if not UserOTPV :
#                 return Response ({"MSG" : "Invalid OTP"} , status= status.HTTP_400_BAD_REQUEST)
#             UserOTPV.delete()
#             return Response({"MSG" : "Done" , "email" : Useremail.email} , status= status.HTTP_200_OK)
#         except :
#             return Response({"MSG" : "Error in server"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)
        
# class ResetPassword(APIView):
#     def post(self , request ):
#         try : 
#             try:
#                 useremail = User.objects.get(email = request.data['email'])
#             except:
#                 return Response ({"MSG" : "Invalid Email"} , status=status.HTTP_400_BAD_REQUEST)
#             if not useremail  or  'X-XXXXX-X-X-XXX-xxx-x' not in  request.headers or not request.headers['X-XXXXX-X-X-XXX-xxx-x'] == 'AhmedAAAAhhmedA':
#                 return Response({"MSG" : "Invalid Email"} , status= status.HTTP_400_BAD_REQUEST)
#             if len(request.data['newpassword']) <8:
#                 return Response ({"Invalid Password"} , status= status.HTTP_400_BAD_REQUEST)
#             useremail.set_password(request.data['newpassword'])
#             useremail.save()
#             return Response({"MSG" : "Done"} , status=status.HTTP_200_OK)
#         except:
#             return Response({"MSG" : "Error in Server"} , status=status.HTTP_500_INTERNAL_SERVER_ERROR)