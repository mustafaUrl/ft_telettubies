import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
from .models import Game
from .game import PongGame
import asyncio
class oneVone(AsyncWebsocketConsumer):
    games = {}
    active_users = {}
    # async def connect(self):
    #     self.user = self.scope["user"]
    #     self.game_id = self.scope['url_route']['kwargs']['game_id']

    #     # Kullanıcı anonimse bağlantıyı kapat
    #     if self.user.is_anonymous:
    #         await self.close()
    #         return

    #     # Oyun ID'sine göre oyunu al veya oluştur
        
    #     if self.game_id not in self.games:
    #         player1_username, player2_username = await self.get_game_usernames(self.game_id)
    #         if player1_username is None or player2_username is None:
    #             print("Oyun bulunamadı")
    #             await self.close()
    #             return
    #         print(player1_username, player2_username,self.game_id)
    #         # Yeni bir PongGame nesnesi oluştur ve games sözlüğünde sakla
    #         self.games[self.game_id] = PongGame(player1_username, player2_username, 800, 600)

    #     # Oyun ID'sine göre PongGame nesnesini al
    #     self.pong_game = self.games[self.game_id]

    #     # Oyun odasına katıl
    #     await self.channel_layer.group_add(
    #         self.game_id,
    #         self.channel_name
    #     )

    #     # WebSocket bağlantısını kabul et
    #     await self.accept()
    async def connect(self):
        self.user = self.scope["user"]
        self.game_id = self.scope['url_route']['kwargs']['game_id']

        # Kullanıcı anonimse bağlantıyı kapat
        if self.user.is_anonymous:
            await self.close()
            return

        # Oyun ID'sine göre oyunu al veya oluştur
        
        if self.game_id not in self.games:
            player1_username, player2_username = await self.get_game_usernames(self.game_id)
            if player1_username is None or player2_username is None:
                print("Oyun bulunamadı")
                await self.close()
                return
            print(player1_username, player2_username,self.game_id)
            # Yeni bir PongGame nesnesi oluştur ve games sözlüğünde sakla
            self.games[self.game_id] = PongGame(player1_username, player2_username, 800, 600)

        # Oyun ID'sine göre PongGame nesnesini al
        self.pong_game = self.games[self.game_id]

        # Oyun odasına katıl
        await self.channel_layer.group_add(
            self.game_id,
            self.channel_name
        )

        # WebSocket bağlantısını kabul et
        await self.accept()
    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return
        # if self.game_id in self.games:
        #     del self.games[self.game_id]
        # await self.channel_layer.group_discard(
        #     self.game_id,
        #     self.channel_name
        # )
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        command = text_data_json['command']

        if command == 'start':
            await self.start_game()
            asyncio.create_task(self.broadcast_game_state())
        if command == 'move':
            # Kullanıcı kimliğini kontrol et
            if self.user.username == self.pong_game.player1_user:
                paddle = 'player1'
            elif self.user.username == self.pong_game.player2_user:
                paddle = 'player2'
            else:
                return  # Eğer kullanıcı oyunculardan biri değilse, işlem yapma
            direction = text_data_json['direction']
            await self.pong_game.move_paddle(paddle, direction)
        if command == 'stop':
            await self.pong_game.stop_paddle(paddle)
        if command == 'leave':
            await self.leave_game()
            await self.close()
     

    async def start_game(self):
        await self.pong_game.start_game()


    @database_sync_to_async
    def save_game_result(self, score_player1, score_player2, winner_username):
        # Oyun sonucunu veritabanına kaydet
        try:
            # Kazananın User nesnesini al
            winner = User.objects.get(username=winner_username)
            
            # Oyunu al ve güncelle
            game = Game.objects.get(id=self.game_id)
            game.player1_score = score_player1
            game.player2_score = score_player2
            game.winner = winner  # winner alanını User nesnesi ile güncelle
            game.save()

            data = {
                'player1_score': score_player1,
                'player2_score': score_player2,
                'winner': winner_username
            }
            self.channel_layer.group_send(
                self.game_id,
                {
                    'type': 'game.over',
                    'data': data,
                }
            )
        except User.DoesNotExist:
            # Kullanıcı bulunamadıysa hata döndür
            print(f"User {winner_username} does not exist.")
        except Game.DoesNotExist:
            # Oyun bulunamadıysa hata döndür
            print(f"Game with id {self.game_id} does not exist.")



    async def stop_broadcast(self):
        # Yayını kes

        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )

    async def game_over(self, event):
        # Oyun bittiğinde tüm oyunculara mesaj gönder
        await self.send(text_data=json.dumps({
            'type': 'game_over',
            'data': event['data']
        }))

    async def broadcast_game_state(self):
        # Oyun ID'sine göre oyun durumunu yayınla
        game = self.games.get(self.game_id)
         
        if game:
            while True:
                game.update_positions()
                game_state = game.get_game_state()
                if game_state['score_player1'] >= game.score_to_win or game_state['score_player2'] >= game.score_to_win:
                    game.running = False
                    if game_state['score_player1'] >= game.score_to_win:
                        winner = game_state['player1_user']
                    else:
                        winner = game_state['player2_user']
                    await self.save_game_result(game_state['score_player1'], game_state['score_player2'], winner )
                    await self.stop_broadcast()
                    break
                # Oyun durumunu her iki oyuncuya da gönder
                await self.channel_layer.group_send(
                    self.game_id,
                    {
                        'type': 'game.state',
                        'game_state': game_state
                    }
                )
                await asyncio.sleep(1/30)
    
    async def game_state(self, event):
        await self.send(text_data=json.dumps({
            'type': 'game_state',
            'game_state': event['game_state']
        }))
    # async def game_state(self, event):
    # # Oyun durumunu grup üzerinden tüm oyunculara gönder
    # await self.channel_layer.group_send(
    #     self.game_id,
    #     {
    #         'type': 'send.game_state',
    #         'game_state': event['game_state']
    #     }
    # )

    # # Grup mesajını işleyecek olan metod
    # async def send_game_state(self, event):
    #     # Oyun durumunu WebSocket üzerinden tüm oyunculara gönder
    #     await self.send(text_data=json.dumps({
    #         'type': 'game_state',
    #         'game_state': event['game_state']
    #     }))

    async def leave_game(self):
        self.leave()
        
        await self.channel_layer.group_send(
            self.game_id,
            {
                'type': 'game.leave',
                'player': self.user.username
            }
        )
        await self.channel_layer.group_discard(
            self.game_id,
            self.channel_name
        )
    
    @database_sync_to_async
    def set_game_winner(self, game_id, winner, player1_score, player2_score):
        game = Game.objects.get(id=game_id)
        game.winner = winner
        game.player1_score = player1_score
        game.player2_score = player2_score
        game.save()

    @database_sync_to_async
    def leave(self):
        # Oyuncuyu oyun odasından çıkar
        game = Game.objects.get(id=self.game_id)
        if self.user == game.player1:
            game.player1_state = 'left'
        elif self.user == game.player2:
            game.player2_state = 'left'
        game.save()
        

    @database_sync_to_async
    def get_game(self, game_id):
        try:
            return Game.objects.get(id=game_id)
        except Game.DoesNotExist:
            return None
    @database_sync_to_async
    def get_game_usernames(self, game_id):
        try:
            game = Game.objects.get(id=game_id)
            return game.player1.username, game.player2.username
        except Game.DoesNotExist:
            return None, None

    
    
    @database_sync_to_async
    def get_user_id(self, game_id):
        try:
            game = Game.objects.get(id=game_id)
            return game.player1.id, game.player2.id
        except Game.DoesNotExist:
            return None, None

    
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer
# from asgiref.sync import sync_to_async
# from channels.db import database_sync_to_async
# from django.contrib.auth.models import User
# from .models import Game
# from .game import PongGame
# import asyncio

# class oneVone(AsyncWebsocketConsumer):
#     games = {}
#     active_users = {}
#     broadcast_tasks = {}

#     async def connect(self):
#         self.user = self.scope["user"]
#         self.game_id = self.scope['url_route']['kwargs']['game_id']

#         if self.user.is_anonymous:
#             await self.close()
#             return

#         if self.game_id not in self.games:
#             player1_username, player2_username = await self.get_game_usernames(self.game_id)
#             if player1_username is None or player2_username is None:
#                 await self.close()
#                 return

#             self.games[self.game_id] = PongGame(player1_username, player2_username, 800, 600)
        
#         self.pong_game = self.games[self.game_id]

#         await self.channel_layer.group_add(
#             self.game_id,
#             self.channel_name
#         )

#         await self.accept()

#     async def disconnect(self, close_code):
#         if self.user.is_anonymous:
#             await self.close()
#             return

#         await self.channel_layer.group_discard(
#             self.game_id,
#             self.channel_name
#         )

#         if self.game_id in self.broadcast_tasks:
#             self.broadcast_tasks[self.game_id].cancel()
#             del self.broadcast_tasks[self.game_id]

#     async def receive(self, text_data):
#         text_data_json = json.loads(text_data)
#         command = text_data_json['command']

#         if command == 'start':
#             await self.start_game()
#             if self.game_id not in self.broadcast_tasks:
#                 self.broadcast_tasks[self.game_id] = asyncio.create_task(self.broadcast_game_state())

#         if command == 'move':
#             if self.user.username == self.pong_game.player1_user:
#                 paddle = 'player1'
#             elif self.user.username == self.pong_game.player2_user:
#                 paddle = 'player2'
#             else:
#                 return
#             direction = text_data_json['direction']
#             await self.pong_game.move_paddle(paddle, direction)

#         if command == 'stop':
#             await self.pong_game.stop_paddle(paddle)

#         if command == 'leave':
#             await self.leave_game()
#             await self.close()

#     async def start_game(self):
#         await self.pong_game.start_game()

#     @database_sync_to_async
#     def save_game_result(self, score_player1, score_player2, winner_username):
#         try:
#             winner = User.objects.get(username=winner_username)
#             game = Game.objects.get(id=self.game_id)
#             game.player1_score = score_player1
#             game.player2_score = score_player2
#             game.winner = winner
#             game.save()
            
#             data = {
#                 'player1_score': score_player1,
#                 'player2_score': score_player2,
#                 'winner': winner_username
#             }
#             async_to_sync(self.channel_layer.group_send)(
#                 self.game_id,
#                 {
#                     'type': 'game.over',
#                     'data': data,
#                 }
#             )
#         except User.DoesNotExist:
#             print(f"User {winner_username} does not exist.")
#         except Game.DoesNotExist:
#             print(f"Game with id {self.game_id} does not exist.")

#     async def stop_broadcast(self):
#         await self.channel_layer.group_discard(
#             self.game_id,
#             self.channel_name
#         )
#         if self.game_id in self.broadcast_tasks:
#             self.broadcast_tasks[self.game_id].cancel()
#             del self.broadcast_tasks[self.game_id]

#     async def game_over(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'game_over',
#             'data': event['data']
#         }))

#     async def broadcast_game_state(self):
#         game = self.games.get(self.game_id)
        
#         if game:
#             while True:
#                 game.update_positions()
#                 game_state = game.get_game_state()
#                 if game_state['score_player1'] >= game.score_to_win or game_state['score_player2'] >= game.score_to_win:
#                     game.running = False
#                     if game_state['score_player1'] >= game.score_to_win:
#                         winner = game_state['player1_user']
#                     else:
#                         winner = game_state['player2_user']
#                     await self.save_game_result(game_state['score_player1'], game_state['score_player2'], winner)
#                     await self.stop_broadcast()
#                     break
                
#                 await self.channel_layer.group_send(
#                     self.game_id,
#                     {
#                         'type': 'game.state',
#                         'game_state': game_state
#                     }
#                 )
#                 await asyncio.sleep(1/30)

#     async def game_state(self, event):
#         await self.send(text_data=json.dumps({
#             'type': 'game_state',
#             'game_state': event['game_state']
#         }))

#     async def leave_game(self):
#         await self.leave()

#         await self.channel_layer.group_send(
#             self.game_id,
#             {
#                 'type': 'game.leave',
#                 'player': self.user.username
#             }
#         )

#         await self.channel_layer.group_discard(
#             self.game_id,
#             self.channel_name
#         )

#     @database_sync_to_async
#     def set_game_winner(self, game_id, winner, player1_score, player2_score):
#         game = Game.objects.get(id=game_id)
#         game.winner = winner
#         game.player1_score = player1_score
#         game.player2_score = player2_score
#         game.save()

#     @database_sync_to_async
#     def leave(self):
#         game = Game.objects.get(id=self.game_id)
#         if self.user == game.player1:
#             game.player1_state = 'left'
#         elif self.user == game.player2:
#             game.player2_state = 'left'
#         game.save()

#     @database_sync_to_async
#     def get_game(self, game_id):
#         try:
#             return Game.objects.get(id=game_id)
#         except Game.DoesNotExist:
#             return None

#     @database_sync_to_async
#     def get_game_usernames(self, game_id):
#         try:
#             game = Game.objects.get(id=game_id)
#             return game.player1.username, game.player2.username
#         except Game.DoesNotExist:
#             return None, None

#     @database_sync_to_async
#     def get_user_id(self, game_id):
#         try:
#             game = Game.objects.get(id=game_id)
#             return game.player1.id, game.player2.id
#         except Game.DoesNotExist:
#             return None, None
