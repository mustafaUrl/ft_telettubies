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
        self.paddle_speed = 5
        self.ball_speed = 5
        self.paddle1 = self.create_paddle(self.grid * 2)
        self.paddle2 = self.create_paddle(self.width - self.grid * 3)
        self.ball = self.create_ball()
        self.running = True
        self.score_to_win = 4
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
            'player1_user': self.player1_user,
            'player2_user': self.player2_user,
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

    