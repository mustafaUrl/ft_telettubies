// import * as THREE from "three";
// import { OrbitControls } from "./examples/jsm/controls/OrbitControls.js";

   
// const scene = new THREE.Scene();
// const renderer = new THREE.WebGLRenderer({
//   antialias: true,
// });
// const normalCamera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// const orbitCamera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// const control = new OrbitControls(orbitCamera, renderer.domElement)

// let currentCamera = normalCamera;

// orbitCamera.position.set(0, 25, 0);
// orbitCamera.lookAt(0, 0, 0);

// normalCamera.position.set(15, 15, 0);
// normalCamera.lookAt(0, 0, 0);
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// function createBox(w, h, d) {
//   const geometry = new THREE.BoxGeometry(w, h, d);
//   const material = new THREE.MeshNormalMaterial();
//   const mesh = new THREE.Mesh(geometry, material);
//   return mesh;
// }

// function createPlane(w, h) {
//   const geometry = new THREE.PlaneGeometry(w, h);
//   const material = new THREE.MeshBasicMaterial({
//     color: 0x1f1f1f,
//     side: THREE.DoubleSide
//   });
//   const mesh = new THREE.Mesh(geometry, material);
//   return mesh;
// }

// function createBall(s) {
//   const geometry = new THREE.SphereGeometry(s, 32, 16);
//   const material = new THREE.MeshBasicMaterial();
//   const mesh = new THREE.Mesh(geometry, material);
//   return mesh;
// }
// //ssr
// const playerLength = 5;

// const player = createBox(1, 1, playerLength);
// player.position.x = 12;
// scene.add(player);

// const plane = createPlane(24, 20)
// plane.rotation.x = Math.PI / 2
// plane.position.y = -0.5
// scene.add(plane)

// const ball = createBall(0.5);
// scene.add(ball);

// //ssr
// let ballVelocityX = 0.1;
// let ballVelocityY = 0.1;

// const borderX = 10;
// const borderY = 11;

// window.addEventListener("keydown", (e) => {
//   switch (e.key) {
//     case "f":
//       currentCamera =
//         currentCamera === normalCamera ? orbitCamera : normalCamera;
//     case "ArrowLeft":
//       player.position.z += 1;
//       break;
//     case "ArrowRight":
//       player.position.z -= 1;
//       break;
//   }
// });
// //ssr
// window.addEventListener("mousemove", (e) => {
//   const r = e.clientX % 255;
//   const g = e.clientY % 255;
//   const b = Math.floor(Math.random() * 255);
//   ball.material.color = new THREE.Color(`rgb(${r}, ${g}, ${b})`);

//   player.position.z = -(e.clientX / window.innerWidth) * 30 + 15;
// });


// // createOpponent fonksiyonu, rakip raket için bir 3D nesne oluşturur.
// function createOpponent(w, h, d) {
//     const geometry = new THREE.BoxGeometry(w, h, d); // w, h, d boyutlarında bir kutu geometrisi oluşturur.
//     const material = new THREE.MeshNormalMaterial(); // Normal malzeme, yüzeyin normal vektörlerine göre renk değiştirir.
//     const mesh = new THREE.Mesh(geometry, material); // Geometri ve malzemeyi kullanarak bir mesh (3D nesne) oluşturur.
//     return mesh; // Oluşturulan mesh'i döndürür.
//   }
  
//   // Rakip raketin boyutları ve oluşturulması.
//   const opponentLength = 5;
//   const opponent = createOpponent(1, 1, opponentLength);
//   opponent.position.x = -12; // Rakibi sahnenin karşı tarafına yerleştirir.
//   scene.add(opponent); // Rakibi sahneye ekler.
  
//   // updateOpponent fonksiyonu, rakibin raketinin topun Z pozisyonuna göre hareketini günceller.
//   function updateOpponent() {
//     const errorMargin = 0.2; // Hata payı, bu değeri değiştirerek yapay zekanın doğruluğunu ayarlayabilirsiniz.
//     const direction = Math.random() > 0.5 ? 1 : -1; // Rastgele bir yön belirler (1 veya -1)
//     const error = Math.random() * errorMargin * direction; // Hata miktarını hesaplar  
//         // Rakibin Z pozisyonunu topun Z pozisyonuna göre ayarlar ve rastgele bir hata ekler
//     opponent.position.z = ball.position.z + error;
//   }
  


 
// //ssr
// let playerScore = 0; // Oyuncunun skoru
// let opponentScore = 0; // Rakibin skoru


// function render() {
//     requestAnimationFrame(render);

//     ball.position.z += ballVelocityX;
//     ball.position.x += ballVelocityY;

//     // check collision with player
//     const playerCollide =
//         ball.position.x > borderY &&
//         ball.position.z >= player.position.z - playerLength / 2 &&
//         ball.position.z <= player.position.z + playerLength / 2;
//     const opponentCollide =
//         ball.position.x < -borderY &&
//         ball.position.z >= opponent.position.z - opponentLength / 2 &&
//         ball.position.z <= opponent.position.z + opponentLength / 2;
      

//     if (ball.position.z > borderX || ball.position.z < -borderX) {
//         ballVelocityX = -ballVelocityX;
//     }

//     if ((playerCollide && ball.position.x > borderY) || (opponentCollide && ball.position.x < -borderY)) {
//         ballVelocityY = -ballVelocityY;
//     }

//     control.target = player.position
//     control.update()
//     updateOpponent();
//     //   updateOpponentWithErrorMargin(); // Rakip güncellemesi, hata payı ile

//     if (ball.position.x > borderY + 2) {
//         ball.position.x = 0;
//         opponentScore++;
//         console.log("Oyuncu Skoru: " + playerScore + " - Rakip Skoru: " + opponentScore);
//       } else if (ball.position.x < -borderY - 2) {
//         ball.position.x = 0;
//         playerScore++;
//         console.log("Oyuncu Skoru: " + playerScore + " - Rakip Skoru: " + opponentScore);
//       }
//     renderer.render(scene, currentCamera);
//     }

//     export default function pong(){
//     //  render();
// }

