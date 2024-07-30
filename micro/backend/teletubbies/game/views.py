
from .models import Match, Round
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist
import logging
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([JWTAuthentication])
def create_match(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        round_instance = None
        # Check if round_id is provided and is a valid integer
        if 'round_id' in data and data['round_id'].isdigit():
            round_instance = get_object_or_404(Round, id=int(data['round_id']))
        match = Match.objects.create(
            round=round_instance,
            player1_username=data['player1_username'],
            player2_username=data['player2_username'],
            player1_score=data['player1_score'],
            player2_score=data['player2_score'],
            winner_username=data['winner_username'],
            match_start_time=data['match_start_time'],
            match_finish_time=data['match_finish_time']
        )
        return JsonResponse({'id': match.id, 'status': 'success'})
    
    return JsonResponse({'status': 'error', 'message': 'Invalid request method'}, status=400)