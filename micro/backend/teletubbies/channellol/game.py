# import random
# import time
# import math
# import socket
# import asyncio
# import json
# from channels.generic.websocket import AsyncWebsocketConsumer

# class Game:
#     def __init__(self, player1_socket, player2_socket):
#         self.player1 = Paddle(player1_socket)
#         self.player2 = Paddle(player2_socket)
#         self.ball = Ball()
#         self.last_time = time.time()

#     def compute_delta(self):
#         current_time = time.time()
#         delta = current_time - self.last_time
#         self.last_time = current_time
#         return delta

#     def update_game_state(self):
#         delta = self.compute_delta()
#         self.ball.update(delta, [self.player1.get_rect(), self.player2.get_rect()])
#         self.player1.update(delta, self.ball.y)
#         self.player2.update(delta, self.ball.y)

#         # Oyun durumunu JSON formatında döndür
#         return {
#             'player1': {'position': self.player1.position, 'score': self.player1.score},
#             'player2': {'position': self.player2.position, 'score': self.player2.score},
#             'ball': {'x': self.ball.x, 'y': self.ball.y}
#         }

#     def play(self):
#         while True:
#             game_state = self.update_game_state()
#             # Oyun durumunu her iki oyuncuya da gönder
#             self.player1.socket.send(game_state)
#             self.player2.socket.send(game_state)
#             time.sleep(0.016)  # Yaklaşık 60 FPS
#             if self.is_lose():
#                 self.handle_lose()

#     def is_lose(self):
#         ball_rect = self.ball.get_rect()
#         return ball_rect['right'] >= 100 or ball_rect['left'] <= 0

#     def handle_lose(self):
#         ball_rect = self.ball.get_rect()
#         if ball_rect['right'] >= 100:
#             self.player1.score += 1
#         else:
#             self.player2.score += 1
#         self.ball.reset()
#         self.player1.reset()
#         self.player2.reset()

# class Paddle:
#     SPEED = 0.02

#     def __init__(self, username):
#         self.username = username
#         self.position = 50
#         self.score = 0

#     def move(self, delta, ball_position):
#         self.position += self.SPEED * delta * (ball_position - self.position)

#     def get_position(self):
#         return self.position

#     def get_rect(self):
#         return {'left': self.position - 1, 'right': self.position + 1, 'top': 0, 'bottom': 100}

#     def reset(self):
#         self.position = 50

# class Ball:
#     INITIAL_VELOCITY = 0.025
#     VELOCITY_INCREASE = 0.00001

#     def __init__(self):
#         self.reset()

#     def reset(self):
#         self.x = 50
#         self.y = 50
#         self.velocity = self.INITIAL_VELOCITY
#         self.direction = {'x': 0, 'y': 0}
#         while abs(self.direction['x']) <= 0.2 or abs(self.direction['x']) >= 0.9:
#             heading = random.uniform(0, 2 * math.pi)
#             self.direction = {'x': math.cos(heading), 'y': math.sin(heading)}

#     def update(self, delta, paddle_rects):
#         self.x += self.direction['x'] * self.velocity * delta
#         self.y += self.direction['y'] * self.velocity * delta
#         self.velocity += self.VELOCITY_INCREASE * delta

#         if self.y <= 0 or self.y >= 100:
#             self.direction['y'] *= -1

#         for rect in paddle_rects:
#             if self.is_collision(rect):
#                 self.direction['x'] *= -1
#                 break

#     def get_position(self):
#         return self.x, self.y

#     def get_rect(self):
#         return {'left': self.x - 1, 'right': self.x + 1, 'top': self.y - 1, 'bottom': self.y + 1}

#     def is_collision(self, rect):
#         ball_rect = self.get_rect()
#         return (
#             rect['left'] <= ball_rect['right'] and
#             rect['right'] >= ball_rect['left'] and
#             rect['top'] <= ball_rect['bottom'] and
#             rect['bottom'] >= ball_rect['top']
#         )

# ##################################################


#         class GameConsumer(AsyncWebsocketConsumer):
#             async def connect(self):
#                 self.room_name = self.scope['url_route']['kwargs']['room_name']
#                 self.room_group_name = 'game_%s' % self.room_name

#                 # Parse room name to get player1 and player2
#                 player1, player2 = self.room_name.split('_')

#                 # Create game instance
#                 self.game = Game(player1_socket=player1, player2_socket=player2)

#                 # Join room group
#                 await self.channel_layer.group_add(
#                     self.room_group_name,
#                     self.channel_name
#                 )

#                 await self.accept()

#                 # Start the game
#                 self.game.play()

#             async def disconnect(self, close_code):
#                 # Leave room group
#                 await self.channel_layer.group_discard(
#                     self.room_group_name,
#                     self.channel_name
#                 )

#             # Receive message from WebSocket
#             async def receive(self, text_data):
#                 text_data_json = json.loads(text_data)
#                 action = text_data_json['action']

#                 if action == 'move':
#                     direction = text_data_json['direction']
#                     if direction == 'right':
#                         self.game.player1.move(delta, self.game.ball.y)
#                     elif direction == 'left':
#                         self.game.player1.move(-delta, self.game.ball.y)

#                 # Send message to room group
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'game_message',
#                         'message': text_data_json
#                     }
#                 )

#             # Receive message from room group
#             async def game_message(self, event):
#                 message = event['message']

#                 # Send message to WebSocket
#                 await self.send(text_data=json.dumps({
#                     'message': message
#                 }))