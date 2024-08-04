from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
from django.db.models import Sum
from .views import JWTAuth
from django.utils import timezone
from datetime import timedelta

# Get the current time



#APIs For Admin Dashboard 
    # 1.We Need Number Of Users 
    # 2.Calculate The Revenue 
    # 3.Count the Number of complinats 
    # 4.calculate the number Of Requests 
    # 5.Categorize it into Three Categories ==> (Finished, Need To Approve, OnGoing, Wating an Offer)

def GetOngingRequests(Qset):
    try:
        queryset = Qset.filter(Status = 'OnGoing')
        requestSerializer = GetRequestSerializer(queryset , many = True)
        queryset = [requestSerializer.data]
    except:
        queryset = []
    return queryset

def GetFinishRequests(Qset):
    ress=[]
    try:
        try:
            queryset = Qset.filter(Status = 'Finish')
        except:
            queryset=[]
        for req in queryset :
            dboffer = Offer.objects.get(RequestID = req.pk , State = True)
            requestSerializer = GetRequestSerializer(req , many = False)
            offerSerializer = OfferSerializer(dboffer , many = False)
            ress.append
            (
                {
                    "request": requestSerializer.data,
                    "Offer":offerSerializer.data
                }
            )
    except:
        ress = []
    return ress

def GetWatingForApproveRequests(Qset):
    ress = []
    try:
        queryset = Qset.filter(Approve = False , Decline = False)
    except:
        queryset = []
    try : 
        for req in queryset:
            dbUser = User.objects.get(pk = req.UserID.pk)
            requestSerializer = GetRequestSerializer(req , many = False)
            userSerializer = ProfileSerializer(dbUser , many = False)
            ress.append({
                "request":requestSerializer.data , 
                "Owner" : userSerializer.data
            })
    except : 
        ress =[]
    return ress

def GetAllComplaints():
    try:
        allcomp= Complaint.objects.filter(seen = False)
        allcompS = Problemserializers(allcomp , many = True)
        return allcompS.data
    except :
        return []

def GetAllAdmins():
    Admins = User.objects.filter(is_superuser = True)
    Admins_s = ProfileSerializer(Admins , many = True)
    return Admins_s.data
    
def GetAllTransactions():
    pass


class GetPindingRequests(APIView):
    def get (self , request , adminid):
        if not JWTAuth(request , adminid):
            return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try:
            try:
                dbuser = User.objects.get(pk = adminid)
            except:
                return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED) 
            if not dbuser.is_superuser:
                return Response({"MSG" : "UNAUTHORIZED"} , status= status.HTTP_401_UNAUTHORIZED)
            try:
                queryset = Request.objects.all()
                queryset = GetWatingForApproveRequests(queryset)
            except:
                queryset=[] 
            return Response({"requests" : queryset} , status= status.HTTP_200_OK)
        except:
            return Response({"MSG" : "Error"} , status= status.HTTP_400_BAD_REQUEST)
         

class GetAdminHomePageVeiw(APIView):
    def get(self , request , userid):
        if not JWTAuth(request , userid):
            return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try:
            dbAdmin = User.objects.get(pk = userid)
        except:
            dbAdmin =None
        if dbAdmin is None or not dbAdmin.is_superuser:
            return Response ({"MSG":"UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)
        
        res={}
        #getrevenuee
        try:
            all_revenue_amounts = revenue.objects.aggregate(total_amount=Sum('amount'))
        except:
            all_revenue_amounts = 0.0 
        res['Revenu'] = all_revenue_amounts
        
        #get All Requests
        try:
            allrequests = Request.objects.all()
        except:
            allrequests = []
        try:
            allrequestsSerializar = GetRequestSerializer(allrequests , many = True)
            res['AllRequests'] = allrequestsSerializar.data
        except:
            res['AllRequests'] = []

        #number Of All Requests 
        NoOfRequests = len(allrequests)
        res['NumberOfAllRequest'] = NoOfRequests
        
        #Get All Pending Requests
        try :
            allPendingRequests = Request.objects.filter(Approve = False , Decline = False).order_by('-PostDate')[:3]
        except:
            allPendingRequests = []
        try:
            allPendingRequestsSerializar = GetRequestSerializer(allPendingRequests , many = True)
            res['AllPendingRequests'] = allPendingRequestsSerializar.data
        except:
            res['AllPendingRequests'] = []

        #Number Of All Pending Requests
        try:
            NoOfAllPendingRequests =len(Request.objects.filter(Approve = False , Decline = False))
            res['NumberOfAllPendingRequests']=NoOfAllPendingRequests
        except:
            res['NumberOfAllPendingRequests'] = 0
        # Get All Complaints
        try:
            allcomplaints = Complaint.objects.all()
        except:
            allcomplaints = []
            
        try:
            AllComplaintSerializars = Problemserializers(allcomplaints , many = True)
            res['AllComplaints']=AllComplaintSerializars.data
        except:
            res['AllComplaints']=[]

        #Number Of All Complaints
        NoAllComplaints = len(allcomplaints)
        res['NumberOfAllComplaints'] = NoAllComplaints
        #Get All Pending Complaints
        try:
            AllPendingComlplaints = Complaint.objects.filter(seen = False)
        except:
            AllPendingComlplaints = []
        
        try:
            AllPendingComlplaintsSerializars = Problemserializers(AllPendingComlplaints , many = True)
            res['AllPendingComplaints'] = AllPendingComlplaintsSerializars.data
        except:
            res['AllPendingComplaints'] =[]
            
        #Number Of All pending Complaints
        NoAllComplaints = len(AllPendingComlplaints)
        res['NumberOfAllPendingComplaints'] = NoAllComplaints
        #Get All Admins
        try:
            AllAdmins = User.objects.filter(is_superuser =True)
        except:
            AllAdmins =[]
        
        try:
            NoAllUsers = User.objects.all().count()
            res['NumberOfAllUsers']=NoAllUsers
        except:
            res['NumberOfAllUsers']=0

        try:
            AllAdminsSerializars = ProfileSerializer(AllAdmins  , many = True)
            res['AllAdmins']=AllAdminsSerializars.data
        except:
            res['AllAdmins'] = []
        
        try:
            AllpendingTransacctions = RequestTransaction.objects.filter(Approve = False , RequestID__isnull=False , OfferID__isnull = False)
            AllpendingTransacctionsSerializers = AllTransactionsSerializars(AllpendingTransacctions , many = True)
            res['AllPendingTransactions'] = AllpendingTransacctionsSerializers.data
            res["NumberOfAllPendingTransactions"] = len(AllpendingTransacctions)
        except:
            res['AllPendingTransactions'] =[]
            res["NumberOfAllPendingTransactions"] = 0
            
        try:
            now = timezone.now()
            one_week_ago = now - timedelta(days=7)
            latest_registers_past_week = User.objects.filter(date_joined__gte=one_week_ago).order_by('-date_joined').count()
            res['NumberOflatestregisters'] = latest_registers_past_week
        except:
            res["NumberOflatestregisters"] = 0
        return Response(res , status=status.HTTP_200_OK)
 

class GetRevenueForAdminView(APIView):
    def get(self , request ,userid):
        if not JWTAuth(request , userid):
            return Response({"MSG" : "Invalid Token"} , status= status.HTTP_401_UNAUTHORIZED)
        try:
            dbAdmin = User.objects.get(pk = userid)
        except:
            dbAdmin =None
        if dbAdmin is None or not dbAdmin.is_superuser:
            return Response ({"MSG":"UNAUTHORIZED"} , status=status.HTTP_401_UNAUTHORIZED)
        
        res={}
        try:
            AllpendingTransacctions = RequestTransaction.objects.filter(Approve = False , RequestID__isnull=False , OfferID__isnull = False).order_by('-Date')
            AllpendingTransacctionsSerializers = AllTransactionsSerializars(AllpendingTransacctions , many = True)
            res['AllPendingTransactions'] = AllpendingTransacctionsSerializers.data
            res["NumberOfAllPendingTransactions"] = len(AllpendingTransacctions)
        except:
            res['AllPendingTransactions'] =[]
            res["NumberOfAllPendingTransactions"] = 0
        try:
            alltrans=[]
            try:
                allRevenueTransactions = revenue.objects.all()
            except:
                allRevenueTransactions = []

            for trans in allRevenueTransactions :
                allRevenueTransactionsSerializars = AllTransactionsSerializars(trans.TransID , many = False)
                alltrans.append({
                    "Transactions":allRevenueTransactionsSerializars.data
                })
        except:
            return Response({"MSG" : "Server Error"} , status= status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response({"RevenueTransactions" :alltrans , "PendingTransactions" :res} , status=status.HTTP_200_OK)       