import asyncio
import json
import math

class PongGame:
    def __init__(self, player1_user, player2_user, width, height):
        self.player1_user = player1_user
        self.player2_user = player2_user
        self.width = width
        self.height = height
        self.grid = 15
        self.paddle_height = self.grid * 5  # 75 olarak ayarlandı
        self.max_paddle_y = self.height - self.grid - self.paddle_height
        self.paddle_speed = 3
        self.ball_speed = 5
        self.paddle1 = self.create_paddle(self.grid * 2)
        self.paddle2 = self.create_paddle(self.width - self.grid * 3)
        self.ball = self.create_ball()
        self.running = True
        self.score_to_win = 5
        self.score_player1 = 0
        self.score_player2 = 0
    def create_paddle(self, x):
        return {'x': x, 'y': self.height / 2, 'dy': 0, 'width': self.grid, 'height': self.paddle_height}

    def create_ball(self):
        return {'x': self.width / 2, 'y': self.height / 2, 'dx': self.ball_speed, 'dy': self.ball_speed, 'width': self.grid, 'height': self.grid}

    async def start_game(self):
        self.running = True
        self.reset_ball()  # Topu başlangıç pozisyonuna getir
    async def move_paddle(self, paddle, direction):
        if paddle == 'player1':
            self.paddle1['dy'] = self.paddle_speed * direction
        elif paddle == 'player2':
            self.paddle2['dy'] = self.paddle_speed * direction

    def collides(self, ball, paddle):
        if (ball['x'] < paddle['x'] + paddle['width'] and
            ball['x'] + ball['width'] > paddle['x'] and
            ball['y'] < paddle['y'] + paddle['height'] and
            ball['y'] + ball['height'] > paddle['y']):
            return True
        return False

    def reset_ball(self):
        self.ball['x'] = self.width / 2
        self.ball['y'] = self.height / 2
        self.ball['dx'] = -self.ball['dx']
        self.ball['dy'] = -self.ball['dy']

    def update_positions(self):
        if self.running:
            self.paddle1['y'] += self.paddle1['dy']
            self.paddle2['y'] += self.paddle2['dy']
            self.ball['x'] += self.ball['dx']
            self.ball['y'] += self.ball['dy']

            # Topun üst veya alt duvara çarpması
            if self.ball['y'] <= 0 or self.ball['y'] >= self.height - self.grid:
                self.ball['dy'] *= -1

            # # Topun sol veya sağ duvara çarpması
            # if self.ball['x'] <= 0 or self.ball['x'] >= self.width - self.grid:
            #     self.ball['dx'] *= -1
            #     self.reset_ball()
        ############################################################################################################
            if self.ball['x'] <= 0:  # Top sol duvara çarptıysa
                self.score_player2 += 1
                self.reset_ball()
                if self.score_player2 >= self.score_to_win:
                    self.running = False
            elif self.ball['x'] >= self.width - self.grid:  # Top sağ duvara çarptıysa
                self.score_player1 += 1
                self.reset_ball()
                if self.score_player1 >= self.score_to_win:
                    self.running = False
        ############################################################################################################

            # Paletlerin sınırlar içinde kalmasını sağlama
            self.paddle1['y'] = max(self.grid, min(self.paddle1['y'], self.max_paddle_y))
            self.paddle2['y'] = max(self.grid, min(self.paddle2['y'], self.max_paddle_y))

            # Top ile paletlerin çarpışma kontrolü
            if self.collides(self.ball, self.paddle1) or self.collides(self.ball, self.paddle2):
                self.ball['dx'] *= -1

    def get_game_state(self):
        # Oyun durumunu döndürürken skorları da ekleyin
        return {
            'paddle1_position': self.paddle1['y'],
            'paddle2_position': self.paddle2['y'],
            'ball_position': {
                'x': self.ball['x'],
                'y': self.ball['y']
            },
            'score_player1': self.score_player1,
            'score_player2': self.score_player2,
            'running': self.running  # Oyunun devam edip etmediği bilgisi
        }
# class PongGame:
#     def __init__(self, player1_user, player2_user, width, height):
#         self.player1_user = player1_user
#         self.player2_user = player2_user
#         self.width = width
#         self.height = height
#         self.grid = 15
#         self.paddle_height = self.grid * 5  # 75 olarak ayarlandı
#         self.max_paddle_y = self.height - self.grid - self.paddle_height
#         self.paddle_speed = 3
#         self.ball_speed = 5
#         self.paddle1 = self.create_paddle(self.grid * 2)
#         self.paddle2 = self.create_paddle(self.width - self.grid * 3)
#         self.ball = self.create_ball()
#         self.running = False
#         # self.move_commands = []  # Hareket komutlarını saklamak için bir liste
#         self.max_bounce_angle = math.pi / 12  # Topun paletten dönme açısı

#     def create_paddle(self, x):
#         return {'x': x, 'y': self.height / 2 - self.paddle_height / 2, 'width': self.grid, 'height': self.paddle_height, 'dy': 0}

#     def create_ball(self):
#         return {'x': self.width / 2, 'y': self.height / 2, 'width': self.grid, 'height': self.grid, 'dx': self.ball_speed, 'dy': -self.ball_speed}

#     async def start_game(self):
#         self.running = True
#         self.reset_ball()  # Topu başlangıç pozisyonuna getir
       
#     def update_positions(self):
#         if self.running:
#             self.paddle1['y'] += self.paddle1['dy']
#             self.paddle2['y'] += self.paddle2['dy']
#             self.ball['x'] += self.ball['dx']
#             self.ball['y'] += self.ball['dy']

#             # Topun üst veya alt duvara çarpması
#             if self.ball['y'] <= 0 or self.ball['y'] >= self.height - self.grid:
#                 self.ball['dy'] *= -1

#             # Topun sol veya sağ duvara çarpması
#             if self.ball['x'] <= 0 or self.ball['x'] >= self.width - self.grid:
#                 self.ball['dx'] *= -1
#                 # Skor güncellemesi ve topun merkeze dönmesi
#                 self.reset_ball()

#             # Paletlerin sınırlar içinde kalmasını sağlama
#             self.paddle1['y'] = max(self.grid, min(self.paddle1['y'], self.max_paddle_y))
#             self.paddle2['y'] = max(self.grid, min(self.paddle2['y'], self.max_paddle_y))

#             # Top ile paletlerin çarpışma kontrolü
#             if self.collides(self.ball, self.paddle1) or self.collides(self.ball, self.paddle2):
#                 self.ball['dx'] *= -1
############################################################################################################
    # def get_game_state(self):
    #     return {
    #         'paddle1_position': self.paddle1['y'],
    #         'paddle2_position': self.paddle2['y'],
    #         'ball_position': {
    #             'x': self.ball['x'],
    #             'y': self.ball['y']
    #         }
    #     }
############################################################################################################

    # def reset_ball(self):
    #     self.ball['x'] = self.width / 2
    #     self.ball['y'] = self.height / 2
    #     # Topun başlangıç yönünü belirle (örneğin sağa doğru)
    #     self.ball['dx'] = self.ball_speed
    #     self.ball['dy'] = 0

    #     # Skor güncellemesi ve topun yeniden başlatılması için ek kodlar buraya eklenebilir
    
    # async def move_paddle(self, paddle, direction):
    #     if paddle == 'player1':
    #         self.paddle1['dy'] = self.paddle_speed * direction
    #     elif paddle == 'player2':
    #         self.paddle2['dy'] = self.paddle_speed * direction

    # def stop_paddle(self, paddle):
    #     if paddle == 'player1':
    #         self.paddle1['dy'] = 0
    #     elif paddle == 'player2':
    #         self.paddle2['dy'] = 0
    # def collides(self, ball, paddle):
    #     # Topun paletle çarpışıp çarpışmadığını kontrol et
    #     if (ball['x'] < paddle['x'] + paddle['width'] and
    #         ball['x'] + ball['width'] > paddle['x'] and
    #         ball['y'] < paddle['y'] + paddle['height'] and
    #         ball['y'] + ball['height'] > paddle['y']):
            
    #         # Topun paletin içine girmesini önle
    #         if ball['dx'] > 0:  # Sağdaki palet için
    #             ball['x'] = paddle['x'] - ball['width']
    #         else:  # Soldaki palet için
    #             ball['x'] = paddle['x'] + paddle['width']
            
    #         # Topun yönünü değiştir
    #         ball['dx'] *= -1
            
    #         # Topun sekme yönünü ayarla
    #         ball_center = ball['y'] + ball['height'] / 2
    #         paddle_center = paddle['y'] + paddle['height'] / 2
    #         collision_position = (ball_center - paddle_center) / (paddle['height'] / 2)
            
    #         # Topun sekme açısını hesapla
    #         bounce_angle = collision_position * self.max_bounce_angle
    #         ball['dy'] = -self.ball_speed * math.sin(bounce_angle)
            
    #         # Topun paletten düzgün bir şekilde sekmesini sağla
    #         if abs(collision_position) < 0.1:  # Eğer top paletin çok ortasına çarparsa
    #             ball['dy'] = 0  # Top düz bir şekilde geri seker
    #         else:
    #             ball['dy'] = self.ball_speed * collision_position
            
    #         return True
    #     return False

# class PongHelper:
#     def __init__(self, x, y, dx, dy, accel, radius, max_y, min_y):
#         self.x = x
#         self.y = y
#         self.dx = dx
#         self.dy = dy
#         self.accel = accel
#         self.radius = radius
#         self.max_y = max_y
#         self.min_y = min_y

#     def accelerate(self, dt):
#         x2 = self.x + (dt * self.dx) + (self.accel * dt * dt * 0.5)
#         y2 = self.y + (dt * self.dy) + (self.accel * dt * dt * 0.5)
#         dx2 = self.dx + (self.accel * dt) * (1 if self.dx > 0 else -1)
#         dy2 = self.dy + (self.accel * dt) * (1 if self.dy > 0 else -1)
#         return {'nx': (x2 - self.x), 'ny': (y2 - self.y), 'x': x2, 'y': y2, 'dx': dx2, 'dy': dy2}

#     def update(self, dt, left_paddle, right_paddle):
#         pos = self.accelerate(dt)

#         if (pos['dy'] > 0) and (pos['y'] > self.max_y):
#             pos['y'] = self.max_y
#             pos['dy'] = -pos['dy']
#         elif (pos['dy'] < 0) and (pos['y'] < self.min_y):
#             pos['y'] = self.min_y
#             pos['dy'] = -pos['dy']

#         paddle = left_paddle if pos['dx'] < 0 else right_paddle
#         pt = self.ball_intercept(paddle, pos['nx'], pos['ny'])

#         if pt:
#             if pt['d'] in ['left', 'right']:
#                 pos['x'] = pt['x']
#                 pos['dx'] = -pos['dx']
#             elif pt['d'] in ['top', 'bottom']:
#                 pos['y'] = pt['y']
#                 pos['dy'] = -pos['dy']

#             if paddle.up:
#                 pos['dy'] *= 0.5 if pos['dy'] < 0 else 1.5
#             elif paddle.down:
#                 pos['dy'] *= 0.5 if pos['dy'] > 0 else 1.5

#         self.set_position(pos['x'], pos['y'])
#         self.set_direction(pos['dx'], pos['dy'])

#     def ball_intercept(self, rect, nx, ny):
#         # ... (same logic as the JavaScript function)
#         pass

#     def intercept(self, x1, y1, x2, y2, x3, y3, x4, y4, d):
#         # ... (same logic as the JavaScript function)
#         pass

#     def set_position(self, x, y):
#         self.x = x
#         self.y = y

#     def set_direction(self, dx, dy):
#         self.dx = dx
#         self.dy = dy

# # Example usage:
# # Create a PongHelper object with initial parameters
# pong = PongHelper(x=0, y=0, dx=1, dy=1, accel=0.1, radius=5, max_y=10, min_y=0)
# # Call the update method with the desired delta time and paddle objects
# pong.update(dt=0.1, left_paddle=LeftPaddle(), right_paddle=RightPaddle())

    # def collides(self, ball, paddle):
    #     # Topun paletle çarpışıp çarpışmadığını kontrol et
    #     if (ball['x'] < paddle['x'] + paddle['width'] and
    #         ball['x'] + ball['width'] > paddle['x'] and
    #         ball['y'] < paddle['y'] + paddle['height'] and
    #         ball['y'] + ball['height'] > paddle['y']):
            
    #         # Topun merkezini bul
    #         ball_center = ball['y'] + ball['height'] / 2
    #         # Paletin merkezini bul
    #         paddle_center = paddle['y'] + paddle['height'] / 2
    #         # Topun paletin merkezine göre pozisyonunu hesapla
    #         collision_position = (ball_center - paddle_center) / (paddle['height'] / 2)
            
    #         # Yeni yön bileşenlerini hesapla
    #         angle = collision_position * (self.max_bounce_angle)
    #         ball['dx'] = self.ball_speed * math.cos(angle)
    #         ball['dy'] = -self.ball_speed * math.sin(angle)
            
    #         # Topun yönünü değiştir
    #         ball['dx'] *= -1

    #         return True
    #     return False

    # def collides(self, ball, paddle):
    #     # Topun paletle çarpışıp çarpışmadığını kontrol et
    #     if (ball['x'] < paddle['x'] + paddle['width'] and
    #         ball['x'] + ball['width'] > paddle['x'] and
    #         ball['y'] < paddle['y'] + paddle['height'] and
    #         ball['y'] + ball['height'] > paddle['y']):
    #         return True
    #     return False


    
    # def collides(self, obj1, obj2):
    #     return (obj1['x'] < obj2['x'] + obj2['width'] and
    #             obj1['x'] + obj1['width'] > obj2['x'] and
    #             obj1['y'] < obj2['y'] + obj2['height'] and
    #             obj1['y'] + obj1['height'] > obj2['y'])
# # Oyun nesnesi oluşturma
# game = PongGame(800, 600)

# # Oyunu başlatma
# game.start_game()

# # Oyuncu hareketleri
# game.move_paddle(player=1, direction=-1)  # Oyuncu 1'in paletini yukarı hareket ettir
# game.move_paddle(player=2, direction=1)   # Oyuncu 2'nin paletini aşağı hareket ettir

# # Oyun döngüsü
# while game.running:
#     game.update_positions()
#     # Burada oyun durumunu WebSocket üzerinden yayınlayabilirsiniz
 