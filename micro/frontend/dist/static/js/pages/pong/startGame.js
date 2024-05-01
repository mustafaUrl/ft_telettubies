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
  // const game_id = getCookie('game_id'); // game_id'yi cookie'den al
  // const socket = new WebSocket(`wss://${window.location.host}/ws/pongVersus/${game_id}/?token=` + getCookie('accessToken'));
  const socket = new WebSocket(`wss://${window.location.host}/ws/pongVersus/41/?token=` + getCookie('accessToken'));

  socket.onopen = function(e) {
    console.log('Pong socket açıldı');
     // Oyunu başlat ve canvas'ı hazırla
    socket.send(JSON.stringify({ command: 'start' })); // Oyunu başlat komutunu gönder
  };

  socket.onmessage = function(event) {
    try {
      const data = JSON.parse(event.data);
      console.log('Pong socket mesajı:', data);
      if (data && data.type === 'game_state' && data.game_state && data.game_state.ball_position) {
        // Gelen verileri kullanarak palet ve topun pozisyonlarını güncelle
        leftPaddle.y = data.game_state.paddle1_position;
        rightPaddle.y = data.game_state.paddle2_position;
        ball.x = data.game_state.ball_position.x;
        ball.y = data.game_state.ball_position.y;
      }
    } catch (error) {
      console.error('Veri işlenirken bir hata oluştu:', error);
    }
  };
  
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
// Oyunu ve canvas'ı başlatan fonksiyon
function initGame() {



  // Palet ve top nesnelerini başlat
  // leftPaddle = { x: grid * 2, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };
  // rightPaddle = { x: canvas.width - grid * 3, y: canvas.height / 2 - paddleHeight / 2, width: grid, height: paddleHeight, dy: 0 };
  // ball = { x: canvas.width / 2, y: canvas.height / 2, width: grid, height: grid, dx: 5, dy: -5 };

  // Oyun döngüsünü başlat
  loop();

 
}

// Sayfa yüklendiğinde oyunu başlat



// function hamlet() {

//   const canvas = document.getElementById('game');
// const context = canvas.getContext('2d');
// const grid = 15;
// const paddleHeight = grid * 5; // 80
// const maxPaddleY = canvas.height - grid - paddleHeight;

// function loop() {
//   requestAnimationFrame(loop);
//   context.clearRect(0, 0, canvas.width, canvas.height);

//   // Paletleri ve topu çiz
//   context.fillStyle = 'white';
//   context.fillRect(grid * 2, leftPaddle.y, grid, paddleHeight);
//   context.fillRect(canvas.width - grid * 3, rightPaddle.y, grid, paddleHeight);
//   context.fillRect(ball.x, ball.y, grid, grid);

//   // Orta çizgiyi çiz
//   context.fillStyle = 'lightgrey';
//   for (let i = grid; i < canvas.height - grid; i += grid * 2) {
//     context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
//   }
// }

// loop();
// }

// function openGameSocket() {
//     if (window.gameSocket && window.gameSocket.readyState === WebSocket.OPEN) {
//       console.log('Pong socket zaten açık');
//       return;}
//       window.game_id = getCookie('game_id');
//     window.gameSocket = new WebSocket(`wss://${window.location.host}/ws/pongVersus/${game_id}/?token=` + getCookie('accessToken'));
   
    
//     function startGame() {
//       socket.send(JSON.stringify({ command: 'start' }));
//     }
    
//     // Paleti hareket ettirmek için 'move' komutunu gönder
//     function movePaddle(paddle, direction) {
//       socket.send(JSON.stringify({
//         command: 'move',
//         paddle: paddle,
//         direction: direction
//       }));
//     }

//     window.gameSocket.onmessage = function(e) {
//       let data = JSON.parse(event.data);
//       // Gelen verileri kullanarak palet ve topun pozisyonlarını güncelle
//       leftPaddle.y = data.paddle1_position;
//       rightPaddle.y = data.paddle2_position;
//       ball.x = data.ball_position.x;
//       ball.y = data.ball_position.y;
//     };
  
//     window.gameSocket.onopen = function(e) {
//       startGame();
//     };
  
//     window.gameSocket.onclose = function(e) {
//       console.error('pong socket closed ', e);
//     };
//     document.addEventListener('keydown', function(e) {
//       // Sağ palet için yukarı ve aşağı ok tuşları
//       if (e.which === 38) { // Yukarı ok
//         movePaddle('rightPaddle', -1);
//       } else if (e.which === 40) { // Aşağı ok
//         movePaddle('rightPaddle', 1);
//       }
    
//       // Sol palet için W ve S tuşları
//       if (e.which === 87) { // W tuşu
//         movePaddle('leftPaddle', -1);
//       } else if (e.which === 83) { // S tuşu
//         movePaddle('leftPaddle', 1);
//       }
//     });
    
//     // Klavye olaylarını dinle ve paleti durdur
//     document.addEventListener('keyup', function(e) {
//       if (e.which === 38 || e.which === 40) {
//         movePaddle('rightPaddle', 0);
//       }
//       if (e.which === 87 || e.which === 83) {
//         movePaddle('leftPaddle', 0);
//       }
//     });
//   }

// function startGame() {


//     openGameSocket();
//     hamlet();
// }


export { startGame, initGame};