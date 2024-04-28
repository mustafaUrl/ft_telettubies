
import asyncio

class GameRoom:
    def __init__(self, player1_username, player2_username):
        # Initialize the game room with player usernames, ball position, velocity, etc.
        self.ball_position = {'z': 0, 'x': 0}
        self.ball_velocity = {'z': 0.5, 'x': 0.5}
        self.players = {
            player1_username: {'position': {'z': 0}, 'score': 0},
            player2_username: {'position': {'z': 0}, 'score': 0}
        }
        self.border_z = 10  # Z ekseni sınırı
        self.border_x = 15  # X ekseni sınırı (genişlik)
        self.border_y = 15
        self.paddle_length = 2

        
    async def start_ball(self):
        # Oyun döngüsünü başlat
        while True:
            self.move_ball()  # Topun hareketini güncelle
            self.update_game_state()  # Oyuncuların durumunu güncelle
            # Oyun durumunu tüm oyunculara yayınla
            # ... (oyunculara durumu yayınlama kodu)
            await asyncio.sleep(0.1)  # Her güncelleme arasında kısa bir bekleme
    def move_ball(self):
        # Topun hareketini güncelle
        self.ball_position['z'] += self.ball_velocity['z']
        self.ball_position['x'] += self.ball_velocity['x']

        # Z ekseni sınırlarla çarpışma kontrolü
        if abs(self.ball_position['z']) >= self.border_z:
            self.ball_velocity['z'] = -self.ball_velocity['z']

        # X ekseni sınırlarla çarpışma kontrolü
        if abs(self.ball_position['x']) >= self.border_x:
            self.ball_velocity['x'] = -self.ball_velocity['x']


    def update_game_state(self):
        for username, player in self.players.items():
            if self.check_collision(player['position']):
                # Adjust the ball's velocity based on where it hit the paddle
                paddle_center = player['position']['z']
                hit_position = self.ball_position['z']
                distance_from_center = hit_position - paddle_center
                bounce_angle = distance_from_center / (self.paddle_length / 2)
                # Adjust the ball's velocity based on the bounce angle
                self.ball_velocity['x'] = abs(self.ball_velocity['x']) * (-1 if hit_position < paddle_center else 1)
                self.ball_velocity['z'] = abs(self.ball_velocity['z']) * (-1 if hit_position < paddle_center else 1)
                # Ensure the ball's velocity doesn't exceed a maximum value
                max_velocity = 1.0
                if abs(self.ball_velocity['x']) > max_velocity:
                    self.ball_velocity['x'] = max_velocity if self.ball_velocity['x'] > 0 else -max_velocity
                if abs(self.ball_velocity['z']) > max_velocity:
                    self.ball_velocity['z'] = max_velocity if self.ball_velocity['z'] > 0 else -max_velocity


    # def update_game_state(self):
    #     # Update the ball's position
    #     # self.ball_position['z'] += self.ball_velocity['z']
    #     # self.ball_position['x'] += self.ball_velocity['x']

    #     # # Check for collisions with the borders
    #     # if abs(self.ball_position['z']) > self.border_x:
    #     #     self.ball_velocity['z'] = -self.ball_velocity['z']

    #     # Check for collisions with the paddles
    #     # Check for collisions with the paddles
    #     for username, player in self.players.items():
    #         if self.check_collision(player['position']):
    #             # Adjust the ball's velocity based on where it hit the paddle
    #             paddle_center = player['position']['z']
    #             hit_position = self.ball_position['z']
    #             distance_from_center = hit_position - paddle_center
    #             bounce_angle = distance_from_center / (self.paddle_length / 2)
    #             # Adjust the ball's velocity based on the bounce angle
    #             self.ball_velocity['x'] = -self.ball_velocity['x'] * bounce_angle
    #             self.ball_velocity['z'] = -self.ball_velocity['z'] * bounce_angle
    #             # Ensure the ball's velocity doesn't exceed a maximum value
    #             max_velocity = 1.0
    #             if abs(self.ball_velocity['x']) > max_velocity:
    #                 self.ball_velocity['x'] = max_velocity if self.ball_velocity['x'] > 0 else -max_velocity
    #             if abs(self.ball_velocity['z']) > max_velocity:
    #                 self.ball_velocity['z'] = max_velocity if self.ball_velocity['z'] > 0 else -max_velocity
                # break
    
    def move_player(self, username, direction):
        """Oyuncunun pozisyonunu günceller."""
        player = self.players[username]
        if direction == 'right':
            player['position']['z'] += 1  # Sağa hareket
        elif direction == 'left':
            player['position']['z'] -= 1  # Sola hareket
        # Oyuncunun pozisyonunu sınırlar içinde tut

    def broadcast_game_state(self):
        # Oyun durumunu tüm oyunculara yayınla
        for username, player in self.players.items():
            # Oyuncunun pozisyonunu diğer oyuncuya göre tersine çevir
            opponent_username = self.get_opponent_username(username)
            opponent_position = self.players[opponent_username]['position']['z']
            player_position = -player['position']['z']  # Pozisyonu ters çevir
            print(f'Sending game state to {username}: ball={self.ball_position}, player={player_position}, opponent={opponent_position}')
            # Oyuncuya ve rakibine güncel pozisyonları gönder
            # ... (WebSocket üzerinden oyunculara durumu yayınlama kodu)
    def get_state(self):
        """Oyunun mevcut durumunu döndürür."""
        return {
            'ball_position': self.ball_position,
            'ball_velocity': self.ball_velocity,
            'players': self.players
        }

    def get_opponent_username(self, username):
        # Bir oyuncunun rakibinin kullanıcı adını döndür
        for player_username in self.players:
            if player_username != username:
                return player_username    
    # Update the scores if the ball goes past the paddles
    # ... (skor güncelleme kodu)

    def check_collision(self, position):
        # Check if the ball collides with a player's paddle
        return (abs(self.ball_position['x']) < self.border_y and
                self.ball_position['z'] >= position['z'] - self.paddle_length / 2 and
                self.ball_position['z'] <= position['z'] + self.paddle_length / 2)

