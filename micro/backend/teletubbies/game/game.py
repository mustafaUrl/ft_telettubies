import asyncio
import json

class PongGame:
    def __init__(self, player1_user, player2_user, width, height):
        self.player1_user = player1_user
        self.player2_user = player2_user
        self.width = width
        self.height = height
        self.grid = 15
        self.paddle_height = self.grid * 5  # 75 olarak ayarlandı
        self.max_paddle_y = self.height - self.grid - self.paddle_height
        self.paddle_speed = 6
        self.ball_speed = 5
        self.paddle1 = self.create_paddle(self.grid * 2)
        self.paddle2 = self.create_paddle(self.width - self.grid * 3)
        self.ball = self.create_ball()
        self.running = False
        self.move_commands = []  # Hareket komutlarını saklamak için bir liste


    def create_paddle(self, x):
        return {'x': x, 'y': self.height / 2 - self.paddle_height / 2, 'width': self.grid, 'height': self.paddle_height, 'dy': 0}

    def create_ball(self):
        return {'x': self.width / 2, 'y': self.height / 2, 'width': self.grid, 'height': self.grid, 'dx': self.ball_speed, 'dy': -self.ball_speed}

    async def start_game(self):
        self.running = True
        self.reset_ball()  # Topu başlangıç pozisyonuna getir
        # await self.game_loop()

    # async def game_loop(self):
    #     while self.running:
    #         # Oyun durumunu güncelle
    #         self.update_positions()

    #         # Oyun durumunu yayınla (await kullanmadan)
    #         # asyncio.create_task(self.broadcast_game_state())

    #         # Hareket komutlarını işle
    #         while self.move_commands:
    #             command = self.move_commands.pop(0)
    #             await self.move_paddle(command['paddle'], command['direction'])

    #         # Oyun hızını ayarla (örneğin, saniyede 60 kare)
    #         await asyncio.sleep(1/60)
       
    def update_positions(self):
        if self.running:
            self.paddle1['y'] += self.paddle1['dy']
            self.paddle2['y'] += self.paddle2['dy']
            self.ball['x'] += self.ball['dx']
            self.ball['y'] += self.ball['dy']

            # Topun üst veya alt duvara çarpması
            if self.ball['y'] <= 0 or self.ball['y'] >= self.height - self.grid:
                self.ball['dy'] *= -1

            # Topun sol veya sağ duvara çarpması
            if self.ball['x'] <= 0 or self.ball['x'] >= self.width - self.grid:
                self.ball['dx'] *= -1
                # Skor güncellemesi ve topun merkeze dönmesi
                self.reset_ball()

            # Paletlerin sınırlar içinde kalmasını sağlama
            self.paddle1['y'] = max(self.grid, min(self.paddle1['y'], self.max_paddle_y))
            self.paddle2['y'] = max(self.grid, min(self.paddle2['y'], self.max_paddle_y))

            # Top ile paletlerin çarpışma kontrolü
            if self.collides(self.ball, self.paddle1) or self.collides(self.ball, self.paddle2):
                self.ball['dx'] *= -1

    def get_game_state(self):
        return {
            'paddle1_position': self.paddle1['y'],
            'paddle2_position': self.paddle2['y'],
            'ball_position': {
                'x': self.ball['x'],
                'y': self.ball['y']
            }
        }
    def reset_ball(self):
        self.ball['x'] = self.width / 2
        self.ball['y'] = self.height / 2
        # Topun başlangıç yönünü belirle (örneğin sağa doğru)
        self.ball['dx'] = self.ball_speed
        self.ball['dy'] = 0

        # Skor güncellemesi ve topun yeniden başlatılması için ek kodlar buraya eklenebilir
    
    async def move_paddle(self, paddle, direction):
        if paddle == 'player1':
            self.paddle1['dy'] = self.paddle_speed * direction
        elif paddle == 'player2':
            self.paddle2['dy'] = self.paddle_speed * direction

    def stop_paddle(self, paddle):
        if paddle == 'player1':
            self.paddle1['dy'] = 0
        elif paddle == 'player2':
            self.paddle2['dy'] = 0
    def collides(self, ball, paddle):
        # Topun paletle çarpışıp çarpışmadığını kontrol et
        if (ball['x'] < paddle['x'] + paddle['width'] and
            ball['x'] + ball['width'] > paddle['x'] and
            ball['y'] < paddle['y'] + paddle['height'] and
            ball['y'] + ball['height'] > paddle['y']):
            return True
        return False


    
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
