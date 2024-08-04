from rest_framework import status
from rest_framework.response import Response
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *  
from .models import *
from .views import JWTAuth 
from django.db.models import Avg 

class GetProfileView(APIView):
    def get(self, request, userid_slug):
        try:
            try:
                Userprofile = User.objects.get(pk=userid_slug)
                UserSkills = User_Skill.objects.filter(UserID=Userprofile.id)
                userSkillSerializer = UserSkillSerializer(UserSkills, many=True)
                Userprojects = Rating.objects.filter(InsID=Userprofile.id)
                userRating = Userprojects.aggregate(Avg("rating"))["rating__avg"]
            except:
                return Response({"MSG" : "Data are inCorrect"} , status= status.HTTP_400_BAD_REQUEST )
            
            allprojects = list(Userprojects)
            res = []
            for project in allprojects:
                dbproject = Request.objects.get(pk=project.requestID.pk)
                projectserial = GetRequestSerializer(dbproject, many=False)
                res.append({"Project":projectserial.data , "rating" :RatingSerializars(project , many = False).data})
            lenocp = len(res)
        except:
            return Response(
                {"MSG": "Invalid User"}, status=status.HTTP_401_UNAUTHORIZED
            )
        ProfileSerializers = ProfileSerializer(Userprofile, many=False)
        return Response(
            {
                "profile": ProfileSerializers.data,
                "Skills": userSkillSerializer.data,
                "Rating": userRating,
                "CompletedProjects": res,
                "NoOfCompletedProjects": lenocp,
            },
            status=status.HTTP_200_OK,
        )

class EditProfileVeiw(APIView):
    def put(self, request, userid):
        if not JWTAuth(request, userid):
            return Response(
                {"MSG": "Invalid Token"}, status=status.HTTP_401_UNAUTHORIZED
            )
        try:
            dbuser = User.objects.get(pk=userid)
        except:
            return Response({"MSG": "Invalid User"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            userskills = request.data["newskills"]
            if userskills:
                userNewSkills = list(str(userskills).split(","))
                for skill in userNewSkills:
                    newskill = {"UserID": dbuser.pk, "skill": skill}
                    userSkillSerializer = UserSkillSerializer(data=newskill)
                    if userSkillSerializer.is_valid():
                        userSkillSerializer.save()
                    else:
                        continue
            userdeleteskills = request.data["deleteskills"]
            if userdeleteskills:
                try:
                    removedSkills = list(str(userdeleteskills).split(","))
                    for skill in removedSkills:
                        deleteskill = User_Skill.objects.filter(UserID=dbuser.id).get(
                            skill=skill
                        )
                        deleteskill.delete()
                except:
                    return Response(
                        {"MSG": "Cannot delete skills"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
            dbuser.Fname = request.data["Fname"]
            dbuser.Lname = request.data["Lname"]
            dbuser.phone = request.data["phone"]
            dbuser.profiledescription = request.data["profiledescription"]
            if request.FILES:
                dbuser.profileImage = request.FILES["image"]
            dbuser.HourSalary = request.data["HourSalary"]
            dbuser.Title = request.data["title"]
        except:
            return Response({"MSG": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)
        dbuser.save()
        return Response({"MSG": "done"}, status=status.HTTP_200_OK)
