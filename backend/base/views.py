from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MyUser, Post
from .serializers import MyUserProfileSerializer, UserRegisterSerializer, PostSerializer

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def auhtenticated(request):
    return Response('authenticated!')
    

@api_view(['POST'])
def register(request):
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors)
    
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        
        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']
            refresh_token = tokens['refresh']

            res = Response()

            res.data = {"success":True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        
        except:
            return Response({'success':False})
        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
            
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            tokens = response.data

            access_token = tokens['access']

            res = Response()

            res.data = {"success":True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        except:
            return Response({'success':False})
   
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_data(request, pk):
    try:
        try:
            user = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response({'error':'user does not exist'})
        
        serializer = MyUserProfileSerializer(user, many=False)

        following = False

        if request.user in user.followers.all():
            following = True

        return Response({**serializer.data, 'is_our_profile': request.user.username == user.username, 'following':following})
    except:
        return Response({'error':'error getting user data'})
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleFollow(request):
    try:
        try:
            my_user = MyUser.objects.get(username=request.user.username)
            user_to_follow = MyUser.objects.get(username=request.data['username'])
        except MyUser.DoesNotExist:
            return Response({'error':'users does not exist'})
        
        if my_user in user_to_follow.followers.all():
            user_to_follow.followers.remove(my_user)
            return Response({'now_following':False})
        else:
            user_to_follow.followers.add(my_user)
            return Response({'now_following':True})
    except:
        return Response({'error':'error following user'})
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users_posts(request, pk):
    try:
        user = MyUser.objects.get(username=pk)
        my_user = MyUser.objects.get(username=request.user.username)
    except MyUser.DoesNotExist:
        return Response({'error':'user does not exist'})
    
    posts = user.posts.all().order_by('-created_at')

    serializer = PostSerializer(posts, many=True)

    data = []

    for post in serializer.data:
        new_post = {}

        if my_user.username in post['likes']:
            new_post = {**post, 'liked':True}
        else:
            new_post = {**post, 'liked':False}
        data.append(new_post)

    return Response(data)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def toggleLike(request):
    try:
        try:
            post = Post.objects.get(id=request.data['id'])
        except Post.DoesNotExist:
            return Response({'error':'post does not exist'})
        
        try:
            user = MyUser.objects.get(username=request.user.username)
        except MyUser.DoesNotExist:
            return Response({'error':'user does not exist'})
        
        if user in post.likes.all():
            post.likes.remove(user)
            return Response({'now_liked':False})
        else:
            post.likes.add(user)
            return Response({'now_liked':True})
    except:
        return Response({'error':'failed to like post'})
