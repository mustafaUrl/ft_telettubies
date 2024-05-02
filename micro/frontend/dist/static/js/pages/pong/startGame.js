import  {getCookie}  from '../../cookies/cookies.js';


// window.gameSocket = '';




// Bu değişkenleri global olarak tanımlayın ki diğer fonksiyonlar tarafından erişilebilsin.
let canvas, context, grid, paddleHeight, maxPaddleY, leftPaddle, rightPaddle, ball;

// Oyunu başlatan fonksiyon
function startGame() {
  // Canvas ve context'i burada başlat
  canvas = document.getElementById('myCanvas');
  context = canvas.getContext('2d');
  grid = 15;
  paddleHeight = grid * 5; // 80
  maxPaddleY = canvas.height - grid - paddleHeight;

  // Diğer değişkenleri burada başlat
  leftPaddle = { x: grid * 2, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };
  rightPaddle = { x: canvas.width - grid * 3, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };
  ball = { x: canvas.width / 2, y: canvas.height / 2, width: grid, height: grid, dx: 5, dy: -5 };
  initGame();
  openGameSocket();
  
}

// WebSocket bağlantısını açan fonksiyon
function openGameSocket() {
  const game_id = getCookie('game_id'); // game_id'yi cookie'den al
  console.log('game_id:', game_id);
  const socket = new WebSocket(`wss://${window.location.host}/ws/pongVersus/${game_id}/?token=` + getCookie('accessToken'));
  // const socket = new WebSocket(`wss://${window.location.host}/ws/pongVersus/41/?token=` + getCookie('accessToken'));

  socket.onopen = function(e) {
    console.log('Pong socket açıldı');
    socket.send(JSON.stringify({ command: 'start' }));

     // Oyunu başlat ve canvas'ı hazırla
  };

  // socket.onmessage = function(event) {
  //   try {
  //     const data = JSON.parse(event.data);
  //     if (data && data.type === 'game_state') {
  //       // Gelen verileri kullanarak palet ve topun pozisyonlarını güncelle
  //       leftPaddle.y = data.game_state.paddle1_position;
  //       rightPaddle.y = data.game_state.paddle2_position;
  //       ball.x = data.game_state.ball_position.x;
  //       ball.y = data.game_state.ball_position.y;
  //     }
  //   } catch (error) {
  //     console.error('Veri işlenirken bir hata oluştu:', error);
  //   }
  // };
  
socket.onmessage = function(event) {
  try {
      const data = JSON.parse(event.data);
      if (data && data.type === 'game_state') {
          // Gelen verileri kullanarak palet ve topun pozisyonlarını ve skoru güncelle
          leftPaddle.y = data.game_state.paddle1_position;
          rightPaddle.y = data.game_state.paddle2_position;
          ball.x = data.game_state.ball_position.x;
          ball.y = data.game_state.ball_position.y;
          
          // Skoru güncelle
          document.getElementById('scorePlayer1').textContent = data.game_state.score_player1;
          document.getElementById('scorePlayer2').textContent = data.game_state.score_player2;
      }
      if (data.type === 'game_over') {
          // Oyun bittiğinde skoru ve kazananı göster
          document.getElementById('scorePlayer1').textContent = data.game_over.score_player1;
          document.getElementById('scorePlayer2').textContent = data.game_over.score_player2;
          document.getElementById('winner').textContent = data.game_over.winner;
          document.getElementById('gameOver').style.display = 'block';
          console.log('Oyun bitti:', data.game_over);
      }
  } catch (error) {
      console.error('Veri işlenirken bir hata oluştu:', error);
  }
};

// Oyun kontrol butonları için event listener'lar
document.getElementById('startButton').addEventListener('click', function() {
  // Oyunu başlatma komutunu server'a gönder
  socket.send(JSON.stringify({ command: 'start' }));
});



document.getElementById('leaveButton').addEventListener('click', function() {
  // Oyundan ayrılma komutunu server'a gönder ve sayfayı yenile
  socket.send(JSON.stringify({ command: 'leave' }));
  location.reload();
});

  // socket.onmessage = function(event) {
  //   const data = JSON.parse(event.data);
  //   // Gelen verileri kullanarak palet ve topun pozisyonlarını güncelle
  //   leftPaddle.y = data.paddle1_position;
  //   rightPaddle.y = data.paddle2_position;
  //   ball.x = data.ball_position.x;
  //   ball.y = data.ball_position.y;
  // };

  socket.onclose = function(e) {
    console.error('Pong socket kapandı', e);
  };

  // Klavye olaylarını dinle
  document.addEventListener('keydown', function(e) {
    // Kullanıcı kimliğini kontrol et (örnek olarak 'player1' ve 'player2' kullanıldı)
  
  
      if (e.which === 38 || e.which === 87) { // Yukarı ok
        socket.send(JSON.stringify({ command: 'move', direction: -1 }));
        console.log('yukarı ok');
      } else if (e.which === 40 || e.which === 83) { // Aşağı ok
        socket.send(JSON.stringify({ command: 'move', direction: 1 }));
        console.log('aşağı ok');
      }

  
  });
  

  // Klavye olaylarını dinle ve paleti durdur
  // document.addEventListener('keyup', function(e) {
  //   if (e.which === 38 || e.which === 40) {
  //     socket.send(JSON.stringify({ command: 'move', paddle: 'rightPaddle', direction: 0 }));
  //     console.log('yukarı ve aşağı oklar bırakıldı');
  //   }
  //   if (e.which === 87 || e.which === 83) {
  //     socket.send(JSON.stringify({ command: 'move', paddle: 'leftPaddle', direction: 0 }));

  //   }
  // });
}
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Paletleri ve topu çiz
  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // Orta çizgiyi çiz
  context.fillStyle = 'lightgrey';
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}
function initGame() {

  loop();
 
}



export { startGame, initGame};