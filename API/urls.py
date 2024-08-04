from django.urls import path , include
from . import views , BalanceView , ForgetPassordView , AdminViews ,AuthenticationService ,RequestsService ,ComplaintService ,ChatService ,OfferService , ProfileServece
urlpatterns = [
    path('signup' , AuthenticationService.SignupView.as_view() , name = "index"),
    path('login' , AuthenticationService.LoginView.as_view() , name = "LoginView"),
    path('logout/<slug:userid_slug>' , AuthenticationService.LogoutVeiw.as_view() , name="LogoutVeiw"),
    path('completeProfile/<slug:id>' , AuthenticationService.CompleteProfile.as_view() , name="CompleteProfile"),
    path('editprofile/<slug:userid>' , ProfileServece.EditProfileVeiw.as_view() , name="EditProfile"),
    path('getprofile/<slug:userid_slug>' , ProfileServece.GetProfileView.as_view() , name="GetDataView"),
    #ForgetPassword
    path('getotp' , ForgetPassordView.GetOTP.as_view() , name="GetOTP"),
    path('verifyotp' , ForgetPassordView.VerifyOTP.as_view() , name="VerifyOTP"),
    path('resetpassword' , ForgetPassordView.ResetPassword.as_view() , name="ResetPassword"),
    #requests
    path('addrequest' , RequestsService.AddRequestView.as_view() , name="AddRequestView"),
    path('requests' , RequestsService.GetAllRequestsView.as_view() , name="GetAllRequestsVeiw"),
    path('requests/<slug:reqid>' , RequestsService.GetRequestView.as_view() , name="GetRequestVeiw"),
    path('userrequests/<slug:userid>' , RequestsService.GetRequestsForUser.as_view() , name="GetRequestsForUser"),
    path('finishrequest/<slug:requestid>/<slug:userid>' , RequestsService.FinishRequest.as_view() , name="FinishRequest"),
    #Offer
    path('addoffer' , OfferService.AddOfferView.as_view() , name="AddOfferView"),
    path('useroffers/<slug:userid>' , OfferService.GetOffersForUser.as_view() , name="GetOffersForUser"),
    path('deleteoffer/<slug:offerid>/<slug:userid>' , OfferService.DeleteOffer.as_view() , name="DeleteOffer"),
    path('acceptoffer/<slug:offerid>/<slug:userid>' , OfferService.AcceptOffer.as_view() ,   name="AcceptOffer"),
    path('declineoffer/<slug:offerid>/<slug:userid>' , OfferService.DeclineOffer.as_view() ,  name="DeclineOffer"),
    #Chat System 
    path('getchat/<slug:requestid>/<slug:userid>' , ChatService.GetChat.as_view() , name="GetChat"),
    path('sendmessage/<slug:userid>/<slug:requestid>' , ChatService.SendMessage.as_view() , name="SendMessage"),
    #Complant
    path('sendcomplaint' , ComplaintService.SendComplaint.as_view() , name="SendComplaint"),
    path('sendreqcomplaint' , ComplaintService.RequestComplaint.as_view() , name="RequestComplaint"),
    path('getcomplaint/<slug:adminid>' , ComplaintService.GetAllComplaint.as_view() , name="GetAllComplaint"),
    path('replycomlaint/<slug:adminid>/<slug:complaintid>' , ComplaintService.ReplyComlaint.as_view() , name="ReplayComlaint"),
    #Balance 
    path('accepttransaction/<slug:transactionID>/<slug:userid>' , BalanceView.AcceptTransaction.as_view() , name="AcceptTransaction"),
    path('balanceandtransactions/<slug:userid>' , BalanceView.GetBalanceAndTransactions.as_view() , name="GetBalanceAndTransactions8"),
    #test 
    path('payment/<slug:userid>', BalanceView.PaymentAPI.as_view(), name='make_payment'),
    path('updatebalance/<slug:amount>/<slug:userid>', BalanceView.UpdateBalance.as_view(), name='UpdateBalance'),
    path('failtransaction/<slug:amount>/<slug:userid>', BalanceView.FalidTransaction.as_view(), name='FalidTransaction'),
    path('withdraw/<slug:userid>', BalanceView.withdraw.as_view(), name='Withdrow'),
    #ADmin
    path('adminhome/<slug:userid>' , AdminViews.GetAdminHomePageVeiw.as_view() , name="GetAdminHomePageVeiw"),
    path('revenueforadmin/<slug:userid>' , AdminViews.GetRevenueForAdminView.as_view() , name="GetRevenueForAdminView"),
    path('acceptrequest/<slug:requestid>/<slug:userid>' , RequestsService.AcceptRequst.as_view() , name="AcceptRequst"),
    path('declinerequest/<slug:requestid>/<slug:userid>' , RequestsService.DeclineRequest.as_view() , name="DeclineRequest"),
    path('getpendingrequests/<slug:adminid>', AdminViews.GetPindingRequests.as_view(), name='GetPindingRequests'),
]