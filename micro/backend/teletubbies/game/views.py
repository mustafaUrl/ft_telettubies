from .models import Match
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.http import JsonResponse
from django.shortcuts import get_object_or_404

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def create_match(request):
    if request.method == 'POST':
        data = json.loads(request.body)


        
        match = Match.objects.create(
            game_mode=data['game_mode'],
            player1_username=data['player1_username'],
            player2_username=data['player2_username'],
            player1_score=data['player1_score'],
            player2_score=data['player2_score'],
            winner_username=data['winner_username'],
            match_start_time=data['match_start_time'],
            match_finish_time=data['match_finish_time']
        )
        if 'tournament_name' in data:
            match.tournament_name = data['tournament_name']
            match.round = data['round_id']
        match.save()
        return JsonResponse({'id': match.id, 'status': 'success'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)
