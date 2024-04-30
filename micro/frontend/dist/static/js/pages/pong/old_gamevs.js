// Assume you have a WebSocket connection established and it's called 'socket'

import  {getCookie}  from '../../cookies/cookies.js';
  
import * as THREE from "three";
// import { OrbitControls } from "./examples/jsm/controls/OrbitControls.js";

// import {  showTab2WithUsername } from '../uimodule/chatBox.js';

// Define global variables for the WebSocket connection and the opponent


// Function to open a WebSocket connection

// Start the rendering loop


// WebSocket message event for receiving game state updates
function starta(){
  function joinGame(opponent) {
    if (window.pongSocket) {
      window.pongSocket.send(JSON.stringify({
        'action': 'join_game',
        'opponent': opponent
      }));
      console.log('Oyun odasına katıldı:', opponent);
    }
  }
  
  // Call this function with the opponent's username to join the game room
  
  // Function to send the start_game action
  function startGame(opponentUsername) {
      if (window.pongSocket) {
        window.pongSocket.send(JSON.stringify({
          'action': 'start',
          'opponent': opponentUsername
        }));
        console.log('Oyun başlatıldı:', opponentUsername);
      }
    }
  
  
     
  const scene = new THREE.Scene();
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  const normalCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const orbitCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // const control = new OrbitControls(orbitCamera, renderer.domElement)
  
  let currentCamera = normalCamera;
  
  orbitCamera.position.set(0, 25, 0);
  orbitCamera.lookAt(0, 0, 0);
  
  normalCamera.position.set(15, 15, 0);
  normalCamera.lookAt(0, 0, 0);
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  function createBox(w, h, d) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshNormalMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  
  function createPlane(w, h) {
    const geometry = new THREE.PlaneGeometry(w, h);
    const material = new THREE.MeshBasicMaterial({
      color: 0x1f1f1f,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  
  function createBall(s) {
    const geometry = new THREE.SphereGeometry(s, 32, 16);
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  }
  //ssr
  const playerLength = 5;
  
  const player = createBox(1, 1, playerLength);
  player.position.x = 12;
  scene.add(player);
  
  const plane = createPlane(24, 20)
  plane.rotation.x = Math.PI / 2
  plane.position.y = -0.5
  scene.add(plane)
  
  const ball = createBall(0.5);
  scene.add(ball);
  function createOpponent() {
    const opponentLength = 5; // Rakip raketin uzunluğu
    const opponentWidth = 1; // Rakip raketin genişliği
    const opponentDepth = 1; // Rakip raketin derinliği
  
    // Rakip raket için geometri ve malzeme oluştur
    const geometry = new THREE.BoxGeometry(opponentWidth, opponentDepth, opponentLength);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Kırmızı renkli malzeme
  
    // Mesh (3D nesne) oluştur ve döndür
    const opponent = new THREE.Mesh(geometry, material);
  
    // Rakip raketin başlangıç pozisyonunu ayarla
    opponent.position.x = -12; // X ekseninde sahnenin karşı tarafına yerleştir
    opponent.position.y = 0.5; // Y ekseninde biraz yukarıda yerleştir
    opponent.position.z = 0; // Z ekseninde ortada yerleştir
  
    return opponent; // Oluşturulan rakip raket nesnesini döndür
  }
  
  // Rakip raket nesnesini oluştur ve sahneye ekle
  const opponent = createOpponent();
  scene.add(opponent);
  
  //ssr
  function openPongSocket() {
    if (window.pongSocket && window.pongSocket.readyState === WebSocket.OPEN) {
      return;
    }
  
    console.log('pongSocket çalıştı');
  
    window.pongSocket = new WebSocket(`wss://${window.location.host}/ws/pong/?token=` + getCookie('accessToken'));
  
    console
    window.pongSocket.onclose = function(e) {
      console.error('WebSocket bağlantısı kapandı:', e);
    };
  
    // Bağlantı açıldığında oyun odasına katıl ve oyunu başlat
    window.pongSocket.onopen = function() {
      joinGame(window.opponent);
      startGame(window.opponent);
    };
  
    // Oyun durumu güncellemelerini işleme
    window.pongSocket.onmessage = function(event) {
      const data = JSON.parse(event.data);
      if (data.type === 'game_state') {
        console.log('Oyun durumu aaaaaa:', data.game_state);
        updateGameState(data.game_state);
      }
      console.log('Oyun durumu bbbbbbbb:', data.game_state);
      
    };
  }
  // function handleRoomLeaving(roomName) {
  //   // Oyun odasından ayrılma ile ilgili işlemler
  //   console.log(`Oyuncu ${roomName} odasından ayrıldı.`);
  //   // Burada, DOM güncellemeleri veya oyun durumunu temizleme gibi işlemler yapılabilir
  // }
  // Oyun durumunu güncelleme
  function updateGameState(gameData) {
    ball.position.x = gameData.ball_position.x;
    ball.position.z = gameData.ball_position.z;
  
    // Oyuncu ve rakip pozisyonlarını güncelle
    player.position.z = gameData.players[getCookie('username')].position.z;
    opponent.position.z = gameData.players[window.opponent].position.z;
  
    // Skorları güncelle
    player.score = gameData.players[getCookie('username')].score;
    opponent.score = gameData.players[window.opponent].score;
  }
  
  // Oyun döngüsü
  // function render() {
  //   requestAnimationFrame(render);
  //   // Oyun nesnelerini güncelle
  //   renderer.render(scene, currentCamera);
  // }
  
  // Kullanıcı hareketlerini gönderme
  function sendPlayerMove(direction) {
    if (window.pongSocket && window.pongSocket.readyState === WebSocket.OPEN) {
      window.pongSocket.send(JSON.stringify({
        'action': 'move',
        'direction': direction,
        'opponent': window.opponent
      }));
      console.log('Player hareketi gönderildi:', direction);
    }
  }
  
  // Klavye olaylarını dinleme
  
  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      // Oyuncu hareketini hesapla ve gönder
      const direction = e.key === "ArrowRight" ? 'right' : 'left';
      sendPlayerMove(direction);
    }
  });
  //ssr
let playerScore = 0; // Oyuncunun skoru
let opponentScore = 0; // Rakibin skoru
// Function to render the game state
function render() {
  requestAnimationFrame(render);

  // Check if the WebSocket connection is established
    // Handle incoming messages (game state updates)
  // Your existing collision and rendering logic
  // ...

  // Render the scene using the renderer
  renderer.render(scene, currentCamera);
}
document.body.appendChild(renderer.domElement);
render();
}





// Start the rendering loop

export default function pongVS(){
  // Open a WebSocket connection
  
  document.getElementById('startButton').addEventListener('click', function(event){
    event.preventDefault();
    starta();
    openPongSocket();
    //stop the rendering if another page is loaded or the game is over(there is no ssr yet)

    this.addEventListener('beforeunload', function() {
      // Stop the rendering loop and close the WebSocket connection
      cancelAnimationFrame(render);
    scene.dispose();
    renderer.dispose();
    });

  });

}

/*export default function pongVS(){
  window.pongSocket = null;
  window.opponent = getCookie('username') == 'ara' ? 'bab' : 'ara';
  openPongSocket();
  
  render();
  console.log('pongVS çalıştı');
}*/