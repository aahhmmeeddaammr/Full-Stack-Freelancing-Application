from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from .models import *
import jwt, datetime
import logging
from .views import JWTAuth , sendMSG
import re
import logging


class SignupView(APIView):
    def post(self, request):
        try:
            useremail = request.data.get("email")
            password = request.data.get("password")

            if not useremail or not password:
                return Response(
                    {"MSG": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST
                )

            if len(password) < 8:
                return Response(
                    {"MSG": "Password must be greater than 8 characters"}, status=status.HTTP_400_BAD_REQUEST
                )

            try:
                usercheck = User.objects.get(email=useremail)
                return Response(
                    {"MSG": "This User already exists"}, status=status.HTTP_400_BAD_REQUEST
                )
            except User.DoesNotExist:
                new_user_data = request.data.copy()
                newuserserial = UserSerializer(data=new_user_data)
                if newuserserial.is_valid():
                    newuserserial.save()
                    # Assuming sendMSG is a function that sends an email
                    sendMSG(newuserserial.data['email'], "Welcome to Xperienced! We love having you here.")
                    return Response(
                        {"MSG": "Signup successful", "User": newuserserial.data},
                        status=status.HTTP_200_OK,
                    )
                else:
                    return Response(
                        {"MSG": "Enter Valid Data", "errors": newuserserial.errors}, status=status.HTTP_400_BAD_REQUEST
                    )

        except Exception as e:
            logging.exception("Error during user signup")
            return Response(
                {"MSG": "Server Error", "error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CompleteProfile(APIView):
    def post(self, request, id):
        try:
            dbuser = User.objects.get(pk=id)
        except User.DoesNotExist:
            return Response({"MSG": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            phone = request.data.get("phone")
            age = request.data.get("age", None)
            hour_salary = float(request.data.get("HourSalary", 0))
            profile_description = request.data.get("profiledescription", "")
            title = request.data.get("title", "")
            image = request.FILES.get("image")
            Faculty = request.data.get("Faculty")
            print(Faculty)
            if Faculty != "Faculty of Computers and Artificial Intelligence, Cairo University" and  Faculty != "Other":
                return Response({"MSG" : "Invalid Faculty"} , status= status.HTTP_400_BAD_REQUEST)
            if Faculty == "Other":
                Faculty = ""
                
            # Validate phone number
            if not re.match(r"^(01)[0125][0-9]{8}$", phone):
                return Response({"MSG": "Invalid phone number"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate age
            if age is None:
                return Response({"MSG": "Invalid age"}, status=status.HTTP_400_BAD_REQUEST)

            # Validate HourSalary
            if hour_salary < 10 or hour_salary > 500:
                return Response({"MSG": "Invalid hourly salary"}, status=status.HTTP_400_BAD_REQUEST)

            # Update user profile
            dbuser.phone = phone
            dbuser.BirthDate = age
            dbuser.profiledescription = profile_description
            dbuser.profileImage = image
            dbuser.HourSalary = hour_salary
            dbuser.Title = title
            dbuser.Faculty = Faculty

            # Process skills
            userskills = str(request.data.get("skills", "")).split(",")
            for skill in userskills:
                newskill = {"UserID": dbuser.pk, "skill": skill.strip()}
                userSkillSerializer = UserSkillSerializer(data=newskill)
                if userSkillSerializer.is_valid():
                    userSkillSerializer.save()
                else:
                    logging.warning(f"Invalid skill data: {newskill}")

            # Set initial balances
            dbuser.balance = 0.0
            dbuser.pendingbalance = 0.0
            dbuser.save()

            return Response({"MSG": "Profile completed successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            logging.exception("Error in completing profile")
            return Response({"MSG": "Invalid data", "error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        try:
            useremai = request.data["email"]
            userpass = request.data["password"]
        except:
            return Response(
                {"MSG": "Enter Valid Data"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            dbuser = User.objects.get(email=useremai)
        except:
            return Response(
                {"MSG": "Incorrect email"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not dbuser.check_password(userpass):
            return Response(
                {"MSG": "Incorrect Password"}, status=status.HTTP_400_BAD_REQUEST
            )
        Role = "User"
        if dbuser.is_superuser:
            Role = "Admin"
        profileserializer = ProfileSerializer(dbuser)
        payload = {
            "id": profileserializer.data['id'],
            "name": dbuser.Fname + " " + dbuser.Lname,
            "email": dbuser.email,
            "Role": Role,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=100),
            "iat": datetime.datetime.utcnow(),
        }
        token = jwt.encode(payload, "secret", algorithm="HS256").encode("utf-8")
        try:
            dbtoken = Token.objects.get(Token = token , UserId = dbuser)
        except:
            dbtoken = None
        if dbtoken is None:    
            nToken = Token(Token=token, UserId=dbuser)
            nToken.save()
            Respons = Response()
        else:
            token = dbtoken.Token
            
        Respons.data = {"MSG": "done", "token": token, "User": profileserializer.data}
        return Respons

class LogoutVeiw(APIView):
    def delete(self, request, userid_slug):
        if not JWTAuth(request, userid_slug):
            return Response(
                {"MSG": "invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            token = "b'" + request.headers["token"] + "'"
            UserToken = Token.objects.get(Token=token)
            UserToken.delete()
        except:
            return Response(
                {"MSG": "Invalid User"}, status=status.HTTP_401_UNAUTHORIZED
            )
        return Response({"MSG": "DONE"}, status=status.HTTP_200_OK)
