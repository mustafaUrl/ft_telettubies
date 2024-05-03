import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async, async_to_sync
from userlol.models import PrivateChatMessage, FriendList
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer
from django.contrib.auth.models import User
# from .gameRoom import GameRoom
import asyncio
from .models import Game
from django.db import models
import uuid
class PongConsumer(AsyncWebsocketConsumer):
    online_users = set()  # Tüm bağlı kullanıcıları tutacak set
    user_rooms = {}
    invites = {}  # Davetlerin tutulacağı sözlük
    tournament = {}

    async def connect(self):
        self.user = self.scope["user"]
        if self.user.is_anonymous:
            await self.close()
            return
        self.tournament_lock = asyncio.Lock() 
        await self.accept()
        self.rooms = {}
        PongConsumer.online_users.add(self.user.username)  
        self.room_group_name = "group_chat_gfg"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

    async def disconnect(self, close_code):
        if self.user.is_anonymous:
            await self.close()
            return

        PongConsumer.online_users.discard(self.user.username)  
        if self.room_group_name:
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
    async def receive(self, text_data):
        if self.user.is_anonymous:
            await self.close()
            return
        text_data_json = json.loads(text_data)
        command = text_data_json["command"]

        if command == "online_players":
            await self.list_online_players()
        if command == "continue_game":
            continuing_game = await self.continuing_game()
            if continuing_game:
                await self.send(text_data=json.dumps({
                    'type': 'already_in_game',
                    'game_id': continuing_game
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'not_in_game'
                }))
        elif command == "create_room":
            await self.create_room()
        elif command == "join_room":
            await self.join_room(text_data_json)
        elif command == "leave_room":
            await self.leave_room(text_data_json)
        elif command == "invite_room":
            await self.invite_room(text_data_json)
        elif command == "move":
            pass
        elif command == "get_invite":
            await self.get_invite()
        elif command == "list_rooms":
            await self.list_rooms()
        elif command == "create_tournament":
            await self.create_tournament()
        elif command == "join_tournament":
            await self.join_tournament(text_data_json)
        elif command == "leave_tournament":
            await self.leave_tournament(text_data_json)
        elif command == "start_tournament":
            await self.start_tournament(text_data_json)
        elif command == "list_tournaments":
            await self.list_tournaments()
    async def create_tournament(self):
        async with self.tournament_lock:
            if len(self.tournament) >= 10:
                await self.send(text_data=json.dumps({
                    'type': 'tournament_full',
                    'message': 'Tournament is already full.'
                }))
                return

            tournament_id = self.generate_tournament_id()
            self.tournament[tournament_id] = {
                'players': [],
                'matches': [],
                'status': 'waiting'  # 'waiting', 'ongoing', 'completed'
            }
            await self.send(text_data=json.dumps({
                'type': 'tournament_created',
                'tournament_id': tournament_id
            }))

    async def join_tournament(self, data):
        tournament_id = data['tournament_id']
        async with self.tournament_lock:
            if tournament_id not in self.tournament:
                await self.send(text_data=json.dumps({
                    'type': 'tournament_not_found',
                    'message': 'Tournament not found.'
                }))
                return

            if len(self.tournament[tournament_id]['players']) >= 10:
                await self.send(text_data=json.dumps({
                    'type': 'tournament_full',
                    'message': 'Tournament is already full.'
                }))
                return

            if self.user.username in self.tournament[tournament_id]['players']:
                await self.send(text_data=json.dumps({
                    'type': 'already_joined',
                    'message': 'You have already joined this tournament.'
                }))
                return

            self.tournament[tournament_id]['players'].append(self.user.username)
            await self.send(text_data=json.dumps({
                'type': 'joined_tournament',
                'tournament_id': tournament_id
        }))

    # async def join_tournament(self, data):
    #     tournament_id = data['tournament_id']
    #     async with self.tournament_lock:
    #         if tournament_id not in self.tournament:
    #             await self.send(text_data=json.dumps({
    #                 'type': 'tournament_not_found',
    #                 'message': 'Tournament not found.'
    #             }))
    #             return

    #         if len(self.tournament[tournament_id]['players']) >= 10:
    #             await self.send(text_data=json.dumps({
    #                 'type': 'tournament_full',
    #                 'message': 'Tournament is already full.'
    #             }))
    #             return

    #         self.tournament[tournament_id]['players'].append(self.user.username)
    #         await self.send(text_data=json.dumps({
    #             'type': 'joined_tournament',
    #             'tournament_id': tournament_id
    #         }))

    # Turnuvadan ayrılma metodu
    async def leave_tournament(self, data):
        tournament_id = data['tournament_id']
        async with self.tournament_lock:
            if tournament_id not in self.tournament:
                await self.send(text_data=json.dumps({
                    'type': 'tournament_not_found',
                    'message': 'Tournament not found.'
                }))
                return

            if self.user.username not in self.tournament[tournament_id]['players']:
                await self.send(text_data=json.dumps({
                    'type': 'not_in_tournament',
                    'message': 'You are not in this tournament.'
                }))
                return

            # Kullanıcıyı turnuva oyuncuları listesinden çıkar
            self.tournament[tournament_id]['players'].remove(self.user.username)

            # Eğer turnuvada kimse kalmadıysa, turnuvayı sil
            if not self.tournament[tournament_id]['players']:
                del self.tournament[tournament_id]
                await self.send(text_data=json.dumps({
                    'type': 'tournament_deleted',
                    'message': 'Tournament has been deleted as there are no more players.'
                }))
            else:
                await self.send(text_data=json.dumps({
                    'type': 'left_tournament',
                    'tournament_id': tournament_id
                }))

    # Turnuva başlatma metodu
    async def start_tournament(self, data):
        tournament_id = data['tournament_id']
        async with self.tournament_lock:
            if tournament_id not in self.tournament:
                await self.send(text_data=json.dumps({
                    'type': 'tournament_not_found',
                    'message': 'Tournament not found.'
                }))
                return

            if self.tournament[tournament_id]['status'] != 'waiting':
                await self.send(text_data=json.dumps({
                    'type': 'tournament_already_started',
                    'message': 'Tournament has already started.'
                }))
                return

            self.tournament[tournament_id]['status'] = 'ongoing'
            # Burada turnuva eşleşmelerini oluşturabilirsiniz
            # Örneğin, rastgele eşleşmeler veya belirli bir algoritma kullanarak

            await self.send(text_data=json.dumps({
                'type': 'tournament_started',
                'tournament_id': tournament_id
            }))

    # Yardımcı metodlar
    def generate_tournament_id(self):
        # Turnuva ID'si üretmek için bir metod
        return 'Tournament_' + str(uuid.uuid4())


    async def list_tournaments(self):
        async with self.tournament_lock:
            if not self.tournament:
                await self.send(text_data=json.dumps({
                    'type': 'tournaments_list',
                    'message': 'There are currently no tournaments available.'
                }))
                return

            tournaments_info = []
            for tournament_id, tournament_data in self.tournament.items():
                tournaments_info.append({
                    'tournament_id': tournament_id,
                    'player_count': len(tournament_data['players']),
                    'status': tournament_data['status']
                })

            await self.send(text_data=json.dumps({
                'type': 'tournaments_list',
                'tournaments': tournaments_info
            }))

    async def list_online_players(self):
        # Bağlı olan tüm kullanıcıları döndür
        online_players_list = list(PongConsumer.online_users)
        await self.send(text_data=json.dumps({
            'type': 'online_players',
            'players': online_players_list
        }))
    async def create_room(self):
        username = self.user.username

        # Kullanıcı zaten bir maçta ise başka bir maç oluşturamaz
        continuing_game = await self.continuing_game()
        if continuing_game:
            await self.send(text_data=json.dumps({
                'type': 'already_in_game',
                'game_id': continuing_game
            }))
            return
        room_name = self.generate_room_name()
        self.room_group_name = f"group_{room_name}"
        
        # Oda bilgisini user_rooms sözlüğünde sakla
        PongConsumer.user_rooms[username] = {"room_name": room_name, "group_name": self.room_group_name, "player1": username, "player2": None}
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Oda oluşturma bilgisini kullanıcılara bildir
        await self.send_room_update()

    async def join_room(self, data):
        room_name = data["room_name"]
        # Kullanıcı zaten bir odadaysa başka bir odaya katılamaz
        if self.user.username in PongConsumer.user_rooms:
            await self.send(text_data=json.dumps({
                'error': 'You are already in a room.'
            }))
            return

        # Oda varsa ve ikinci oyuncu yoksa, kullanıcıyı odaya kat
        for user, room_info in PongConsumer.user_rooms.items():
            if room_info["room_name"] == room_name and room_info["player2"] is None:
                room_info["player2"] = self.user.username
                await self.send_event_message('chat.message', f"{self.user.username} has joined the room.")
                await self.send_room_update()
                
                # İkinci oyuncu katıldıktan sonra oyunu başlat
                game = await self.create_game(room_info["player1"], room_info["player2"])
                if game:
                    # Oyun başarıyla oluşturulduysa, oyunculara oyun ID'sini gönder
                     for username, room_info in PongConsumer.user_rooms.items():
                        await self.send(text_data=json.dumps({
                            "type": "game_started",
                            "player1": room_info['player1'],
                            "player2": room_info['player2'],
                            "game_id": game.id
                        }))
                
                        await self.channel_layer.group_send(
                            room_info['group_name'],
                            {
                                "type": "game_start",
                                "player1": room_info['player1'],
                                "player2": room_info['player2'],
                                "game_id": game.id
                            }
                        )
                else:
                    # Oyun oluşturulamadıysa hata mesajı gönder
                    await self.send(text_data=json.dumps({
                        'error': 'Game could not be created.'
                    }))
                break
    # # Oyun başlama event'ını işleyen fonksiyon
    # async def send_game_start(self, game_id, player1, player2):
    #     # Oyun başlama bilgisini odadaki tüm kullanıcılara gönder
    #     await self.channel_layer.group_send(
    #         self.room_group_name,
    #         {
    #             "type": "game.start",  # Bu, işleyici metodunuzun adı olacak
    #             "game_id": game_id,
    #             "player1": player1,
    #             "player2": player2
    #         }
    #     )

    # Oyun başlama event'ını işleyen fonksiyon
    async def game_start(self, event):
        # Oyun başlatma bilgisini al
        game_id = event['game_id']
        player1 = event['player1']
        player2 = event['player2']

        # Oyun başlatma bilgisini odadaki tüm kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'type': 'game_started',
            'game_id': game_id,
            'player1': player1,
            'player2': player2
        })) 
    # async def join_room(self, data):
    #         room_name = data["room_name"]
    #         # Kullanıcı zaten bir odadaysa başka bir odaya katılamaz
    #         if self.user.username in PongConsumer.user_rooms:
    #             await self.send(text_data=json.dumps({
    #                 'error': 'You are already in a room.'
    #             }))
    #             return

    #         # Oda varsa ve ikinci oyuncu yoksa, kullanıcıyı odaya kat
    #         for user, room_info in PongConsumer.user_rooms.items():
    #             if room_info["room_name"] == room_name and room_info["player2"] is None:
    #                 room_info["player2"] = self.user.username
    #                 await self.send_event_message('chat.message', f"{self.user.username} has joined the room.")
    #                 # await self.channel_layer.group_send(
    #                 #     room_info["group_name"],
    #                 #     {
    #                 #         "type": "chat_message",
    #                 #         "message": f"{self.user.username} has joined the room."
    #                 #     }
    #                 # )
    #                 await self.send_room_update()
    #                 break

    async def leave_room(self, data):
        username = self.user.username
        room_name = data["room_name"]
        
        # Kullanıcı odalardan birinde mi diye kontrol et
        for user_room_key, user_room_info in PongConsumer.user_rooms.items():
            if user_room_info["room_name"] == room_name:
                # Kullanıcıyı odadan çıkar
                if username == user_room_info["player1"]:
                    user_room_info["player1"] = None
                    # Oda kurucusu odadan çıkıyorsa ve başka oyuncu varsa
                    if user_room_info["player2"]:
                        # player2'nin oda listesinden odayı sil
                        player2_room_key = f"room_{user_room_info['player2']}"
                        if player2_room_key in PongConsumer.user_rooms:
                            del PongConsumer.user_rooms[player2_room_key]
                    # Odayı tamamen sil
                    del PongConsumer.user_rooms[user_room_key]
                    await self.send_event_message('room.close', f"The room {room_name} has been closed.")
                elif username == user_room_info["player2"]:
                    user_room_info["player2"] = None
                    await self.send_event_message('room.leave', f"{username} has left the room {room_name}.")
                
                # Oda ayrılma bilgisini kullanıcılara bildir
                await self.send_room_update()
                break  # Oda bulundu ve işlem yapıldı, döngüden çık

    # async def ready(self, data):
    #     room_name = data['room_name']
    #     # Oda bilgilerini al
    #     print(PongConsumer.user_rooms)
    #     room_info = None
    #     # 'user_rooms' içinde 'room_name' ile eşleşen oda bilgilerini ara
    #     for user_room_key, user_room_info in PongConsumer.user_rooms.items():
    #         if user_room_info["room_name"] == room_name:
    #             room_info = user_room_info
    #             break

    #     print(room_info)
    #     if room_info:
    #         player1_username = room_info['player1']
    #         player2_username = room_info['player2']
    #         # Her iki oyuncu da hazırsa oyunu başlat
    #         PongConsumer.ready_status[self.user.username] = True
    #         if PongConsumer.ready_status.get(player1_username) and PongConsumer.ready_status.get(player2_username):
    #             # Oyunu oluştur ve başlat
    #             game = await self.create_game(player1_username, player2_username)
    #             if game:
    #                 # Oyun başarıyla oluşturulduysa, oyunculara oyun ID'sini gönder
    #                 await self.send_event_message('game_start',  game.id)
    #             else:
    #                 # Oyun oluşturulamadıysa hata mesajı gönder
    #                 await self.send(text_data=json.dumps({
    #                     'error': 'Game could not be created.'
    #                 }))
    #         else:
    #             # Her iki oyuncu da hazır değilse hata mesajı gönder
    #             await self.send(text_data=json.dumps({
    #                 'error': 'Both players are not ready.'
    #             }))
    #     else:
    #         # Oda bulunamadıysa hata mesajı gönder
    #         await self.send(text_data=json.dumps({
    #             'error': f'Room {room_name} does not exist.'
    #         }))




  


    async def invite_room(self, data):
        invited_username = data["username"]
        # Kullanıcı veya davet edilen kullanıcı zaten bir odadaysa davet gönderme
        if self.user.username in PongConsumer.user_rooms or invited_username in PongConsumer.user_rooms:
            await self.send(text_data=json.dumps({
                'error': 'One of the users is already in a room.'
            }))
            return

        # Davet oluştur ve davet listesine ekle
        room_name = f"room_{self.user.username}"
        PongConsumer.invites[room_name] = {"player1": self.user.username, "player2": invited_username}
        # Davet edilen kullanıcıya daveti gönder (bu kısım uygulamanıza özel olacaktır)
        await self.send_invite_to_user(invited_username, room_name)

        self.room_name = self.generate_room_name()
        self.room_group_name = f"group_{self.room_name}"
        self.rooms[self.room_name] = {"player1": self.user.username, "player2": invited_username}
        PongConsumer.user_rooms[self.user.username] = self.room_name
        PongConsumer.user_rooms[invited_username] = self.room_name
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        # Oda oluşturma ve davet bilgisini kullanıcılara bildir
        await self.send_room_update()

    async def get_invite(self):
        # Kullanıcının davet edildiği odaları listele
        user_invites = {room: players for room, players in PongConsumer.invites.items() if players["player2"] == self.user.username}
        await self.send(text_data=json.dumps({
            'type': 'get_invite',
            'invites': user_invites
        }))    
    async def list_rooms(self):
        # Odaları ve her odadaki kullanıcıları içeren bir sözlük oluştur
        rooms_info = {
            user: {
                'room_name': room_info['room_name'],
                'players': [room_info['player1'], room_info['player2']] if room_info['player2'] else [room_info['player1']]
            }
            for user, room_info in PongConsumer.user_rooms.items()
        }
        # Oda bilgilerini JSON formatında döndür
        await self.send(text_data=json.dumps({
            'type': 'list_rooms',
            'rooms': rooms_info
        }))


    async def send_invite_to_user(self, username, room_name):
        # Davet edilen kullanıcının WebSocket bağlantısını bul
        if username in PongConsumer.online_users:
            # Davet mesajını oluştur
            invite_message = json.dumps({
                'type': 'invite',
                'room_name': room_name,
                'from_user': self.user.username
            })
            # Davet edilen kullanıcıya daveti gönder
            await self.channel_layer.group_send(
                username,  # Bu, davet edilen kullanıcının grup adı veya kanal adı olmalıdır.
                {
                    "type": "websocket.send",
                    "text": invite_message
                }
            )
        else:
            # Davet edilen kullanıcı çevrimiçi değilse daveti gönderen kullanıcıya bildir
            await self.send(text_data=json.dumps({
                'error': f"User {username} is not online or does not exist."
            }))
           
    
    async def send_room_update(self):
        # Tüm odaların durumunu tüm kullanıcılara bildir
        for username, room_info in PongConsumer.user_rooms.items():
            # Kendi durumunu da dahil et
            
                await self.send(text_data=json.dumps({
                    "type": "room_update",
                    "room_name": room_info['room_name'],
                    "player1": room_info['player1'],
                    "player2": room_info['player2'] if room_info['player2'] else 'Waiting for player...'
                }))
           
                await self.channel_layer.group_send(
                    room_info['group_name'],
                    {
                        "type": "room_update",
                        "room_name": room_info['room_name'],
                        "player1": room_info['player1'],
                        "player2": room_info['player2'] if room_info['player2'] else 'Waiting for player...'
                    }
                )

    # async def send_room_update(self):
    #     # Tüm odaların durumunu tüm kullanıcılara bildir
    #     for username, room_info in PongConsumer.user_rooms.items():
    #         await self.channel_layer.group_send(
    #             room_info['group_name'],
    #             {
    #                 "type": "room_update",
    #                 "room_name": room_info['room_name'],
    #                 "player1": room_info['player1'],
    #                 "player2": room_info['player2'] if room_info['player2'] else 'Waiting for player...'
    #             }
    #         )
    async def room_update(self, event):
        # Oda güncelleme bilgisini WebSocket üzerinden kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'type': 'room_update',
            'room_name': event['room_name'],
            'player1': event['player1'],
            'player2': event['player2']
        }))
    # async def send_event_message(self, event_type, message):
    #     # Event tipine göre mesajı WebSocket üzerinden kullanıcılara gönder
    #     await self.send(text_data=json.dumps({
    #         'type': event_type,
    #         'content': message
    #     }))

    async def send_event_message(self, event_type, message):
        # Oda bilgisini al
        room_info = PongConsumer.user_rooms.get(self.user.username)
        
        # Eğer kullanıcı bir odada ise, sadece o odadaki kullanıcılara mesaj gönder
        if room_info:
            # Oda içindeki her iki oyuncuya da mesaj gönder
            for username in [room_info["player1"], room_info["player2"]]:
                if username:
                    # Kullanıcının kanal adını al
                    channel_name = PongConsumer.online_users.get(username)
                    # Eğer kanal adı varsa, kullanıcıya doğrudan mesaj gönder
                    print(channel_name)
                    if channel_name:
                        await self.channel_layer.send(
                            channel_name,
                            {
                                "type": "websocket.send",
                                "text": json.dumps({
                                    'type': event_type,
                                    'content': message
                                })
                            }
                        )
                    print("channel_name")

    @database_sync_to_async
    def create_game(self, player1_username, player2_username):
        try:
            player1 = User.objects.get(username=player1_username)
            player2 = User.objects.get(username=player2_username)
            game = Game.objects.create(player1=player1, player2=player2)
            return game
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def continuing_game(self):
        self.user = self.scope["user"]
        # Kullanıcının player1 veya player2 olarak yer aldığı ve kazananın henüz belirlenmediği oyunları filtrele
        game_without_winner = Game.objects.filter(
            models.Q(player1=self.user) | models.Q(player2=self.user),
            winner__isnull=True
        ).first()  # İlk eşleşen oyunu al

        # Eğer böyle bir oyun varsa oyunun ID'sini, yoksa 0 döndür
        return game_without_winner.id if game_without_winner else 0
    
            

    async def chat_message(self, event):
        # Oda bilgisini WebSocket üzerinden kullanıcılara gönder
        await self.send(text_data=json.dumps({
            'message': event['message']
        }))
    def generate_room_name(self):
        username = self.user.username
        return f"room_{username}"
        
  
    def update_user_status(self, user, status):
        self.online_users[user.username] = status
    
    
    

