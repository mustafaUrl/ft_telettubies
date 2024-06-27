// import * as THREE from 'three';

// export default function game() {
//     // Sabit canvas boyutları
//     const canvasWidth = 1300;
//     const canvasHeight = 800;

//     // Canvas elementini oluşturun ve tarayıcıya ekleyin
//     const canvas = document.createElement('canvas');
//     canvas.width = canvasWidth;
//     canvas.height = canvasHeight;
//     canvas.style.display = 'block';
//     canvas.style.margin = 'auto';
//     canvas.style.position = 'absolute';
//     canvas.style.top = '50px'; // Navbar yüksekliği için ayar yapabilirsiniz
//     canvas.style.bottom = '0';
//     canvas.style.left = '0';
//     canvas.style.right = '0';

//     const gameContainer = document.getElementById('main-content');
//     gameContainer.innerHTML = '';
//     gameContainer.appendChild(canvas);

//     // WebGL renderer oluşturun ve canvas elementini kullanın
//     const renderer = new THREE.WebGLRenderer({ canvas });

//     // Sahne oluşturma
//     const scene = new THREE.Scene();

//     // Kamera oluşturma
//     const aspectRatio = canvasWidth / canvasHeight;
//     const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
//     camera.position.set(800, 21, 800); // Kamerayı daha uzak bir noktaya konumlandır
//     camera.lookAt(0, 0, 0);

//     // Başlangıçta kamera açısının değiştirilmediği durumu tutan değişken
//     let isCameraRotated = false;

//     // Paddle'ların geometri ve malzemelerini ayarla
//     const paddleWidth = 30; // Canvas genişliğine göre paddle genişliğini ayarla
//     const paddleHeight = 150; // Paddle yüksekliği
//     const paddleDepth = 40; // Paddle derinliği
//     const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
//     const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xf0e6ff });
    
//     const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff1500 });
//     // Paddle'ları oluştur ve pozisyonlarını ayarla
//     const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
//     const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);


//     const edges1 = new THREE.EdgesGeometry(paddleGeometry);
//     const line1 = new THREE.LineSegments(edges1, edgeMaterial);
//     paddle1.add(line1);
    
//     const edges2 = new THREE.EdgesGeometry(paddleGeometry);
//     const line2 = new THREE.LineSegments(edges2, edgeMaterial);
//     paddle2.add(line2);

//     paddle1.position.set(-canvasWidth / 2 + paddleWidth / 2, 0, 0); // Sol paddle
//     paddle2.position.set(canvasWidth / 2 - paddleWidth / 2, 0, 0); // Sağ paddle
//     scene.add(paddle1);
//     scene.add(paddle2);

//     // Topun geometri ve malzemesini ayarla
//     const ballRadius = 20;
//     const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
//     const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//     const ball = new THREE.Mesh(ballGeometry, ballMaterial);
//     ball.position.set(0, 0, 0); // Topun başlangıç pozisyonu
//     scene.add(ball);

//     // Topun hızını ve yönünü ayarla (ilk olarak topu hareket ettir)
//     let ballSpeed = 5;
//     let ballDirection = new THREE.Vector3(1, 1, 0).normalize();

//     // Skorları tutmak için değişkenler
//     let scoreP1 = 0;
//     let scoreP2 = 0;


// // Hareket miktarını ve klavye olaylarını sıklaştırma
// const paddleMoveStep = 30; // Her klavye olayında paddle'ın hareket edeceği adım miktarı

// // Klavye olaylarını dinle
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'f':
//             isCameraRotated = !isCameraRotated; // F tuşuna basıldığında kamera durumunu değiştir
//             break;
//         case 'w':
//             // Sol paddle'ı yukarı hareket ettir
//             if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
//                 paddle1.position.y += paddleMoveStep;
//             }
//             break;
//         case 's':
//             // Sol paddle'ı aşağı hareket ettir
//             if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
//                 paddle1.position.y -= paddleMoveStep;
//             }
//             break;
//         case 'ArrowUp':
//             // Sağ paddle'ı yukarı hareket ettir
//             if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
//                 paddle2.position.y += paddleMoveStep;
//             }
//             break;
//         case 'ArrowDown':
//             // Sağ paddle'ı aşağı hareket ettir
//             if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
//                 paddle2.position.y -= paddleMoveStep;
//             }
//             break;
//         default:
//             break;
//     }
// });

// // Animasyon döngüsü
// function animate() {
//     requestAnimationFrame(animate);

//     // Kamera açısını değiştirme
//     if (isCameraRotated) {
//         camera.position.set(800, 0, 0); // Kamerayı yana çevir
//         camera.lookAt(0, 0, 0);
//     } else {
//         camera.position.set(0, 0, 800); // Kamerayı önceki konumuna getir
//         camera.lookAt(0, 0, 0);
//     }

//     // Topu hareket ettir
//     ball.position.add(ballDirection.clone().multiplyScalar(ballSpeed));

//     // Topun sınırları kontrol et ve eğer sınıra çarparsa yönünü tersine çevir
//     if (ball.position.y + ballRadius > canvasHeight / 2) {
//         // Üst sınıra çarpma kontrolü
//         ballDirection.setY(ballDirection.y * -1);
//     } else if (ball.position.y - ballRadius < -canvasHeight / 2) {
//         // Alt sınıra çarpma kontrolü
//         ballDirection.setY(ballDirection.y * -1);
//     }

//     // Topun pedallara çarpma kontrolü
//     if (ball.position.x + ballRadius > paddle2.position.x - paddleWidth / 2 &&
//         ball.position.x - ballRadius < paddle2.position.x + paddleWidth / 2 &&
//         ball.position.y + ballRadius > paddle2.position.y - paddleHeight / 2 &&
//         ball.position.y - ballRadius < paddle2.position.y + paddleHeight / 2) {
//         // Sağ pedala çarpma
//         ballDirection.setX(ballDirection.x * -1);
//         ballDirection.setY((ball.position.y - paddle2.position.y) / (paddleHeight / 2));
//     } else if (ball.position.x - ballRadius < paddle1.position.x + paddleWidth / 2 &&
//         ball.position.x + ballRadius > paddle1.position.x - paddleWidth / 2 &&
//         ball.position.y + ballRadius > paddle1.position.y - paddleHeight / 2 &&
//         ball.position.y - ballRadius < paddle1.position.y + paddleHeight / 2) {
//         // Sol pedala çarpma
//         ballDirection.setX(ballDirection.x * -1);
//         ballDirection.setY((ball.position.y - paddle1.position.y) / (paddleHeight / 2));
//     }

//     // Topun sahayı terk etme kontrolü ve skor güncelleme
//     if (ball.position.x + ballRadius > canvasWidth / 2) {
//         // Sağ sınırdan çıktı, sol oyuncu puan kazanır
//         scoreP1++;
//         resetBall();
//     } else if (ball.position.x - ballRadius < -canvasWidth / 2) {
//         // Sol sınırdan çıktı, sağ oyuncu puan kazanır
//         scoreP2++;
//         resetBall();
//     }

//     // Sahneyi ve kamerasını güncelle
//     renderer.render(scene, camera);
// }

// // Topu başlangıç pozisyonuna ve rastgele yön ve hızla yerleştir
// function resetBall() {
//     ball.position.set(0, 0, 0);
//     // Rastgele yön seçimi
//     let randomAngle = Math.random() * Math.PI - Math.PI / 2; // -π/2 ile π/2 arasında rastgele açı
//     ballDirection.set(Math.cos(randomAngle), Math.sin(randomAngle), 0).normalize();
// }


// animate();
// }
















// import * as THREE from 'three';

// const canvas = document.createElement('canvas');
// canvas.style.display = 'block';
// canvas.style.margin = 'auto';
// canvas.style.position = 'absolute';
// canvas.style.top = '0';
// canvas.style.bottom = '0';
// canvas.style.left = '0';
// canvas.style.right = '0';
// document.body.appendChild(canvas);

// // Canvas boyutlarını belirleyin
// const canvasWidth = 800;
// const canvasHeight = 600;
// canvas.width = canvasWidth;
// canvas.height = canvasHeight;

// const renderer = new THREE.WebGLRenderer({ canvas });
// renderer.setSize(canvasWidth, canvasHeight);

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);
// camera.position.z = 5;

// // Paddle ve topun boyutları
// const paddleWidth = 0.2, paddleHeight = 1, paddleDepth = 0.2;
// const ballRadius = 0.1;

// // Paddles
// const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
// const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// const leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
// leftPaddle.position.x = -3;
// scene.add(leftPaddle);

// const rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
// rightPaddle.position.x = 3;
// scene.add(rightPaddle);

// // Ball
// const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
// const ballMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const ball = new THREE.Mesh(ballGeometry, ballMaterial);
// scene.add(ball);

// // Işık ekleme
// const light = new THREE.AmbientLight(0xffffff);
// scene.add(light);

// // Üst ve alt duvarların boyutları
// const wallDepth = 0.1;
// const wallHeight = canvasHeight / 200; // Canvas yüksekliğine göre dinamik ayarlama

// // Üst duvar
// const topWallGeometry = new THREE.BoxGeometry(canvasWidth, wallHeight, wallDepth);
// const topWallMaterial = new THREE.MeshBasicMaterial({ color: 0x0949ea });
// const topWall = new THREE.Mesh(topWallGeometry, topWallMaterial);
// // topWall.position.set(0, canvasHeight / 2 - wallHeight / 2, -2);
// scene.add(topWall);

// // Alt duvar
// const bottomWallGeometry = new THREE.BoxGeometry(canvasWidth, wallHeight, wallDepth);
// const bottomWall = new THREE.Mesh(bottomWallGeometry, topWallMaterial);
// // bottomWall.position.set(0, -canvasHeight / 2 + wallHeight / 2, -2);
// scene.add(bottomWall);

// topWall.position.set(0, canvasHeight / 2 - wallHeight / 2, 0.2); // Adjusted z-coordinate
// bottomWall.position.set(0, -canvasHeight / 2 + wallHeight / 2, 0.2); // Adjusted z-coordinate

// // Topun hızı ve skor
// let ballSpeedX = 0.02;
// let ballSpeedY = 0.02;
// let scoreLeft = 0;
// let scoreRight = 0;

// // Paddle kontrolü için event listeners
// const paddleSpeed = 0.2;
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'w':
//             leftPaddle.position.y = Math.min(leftPaddle.position.y + paddleSpeed, 2.5 - paddleHeight / 2);
//             break;
//         case 's':
//             leftPaddle.position.y = Math.max(leftPaddle.position.y - paddleSpeed, -2.5 + paddleHeight / 2);
//             break;
//         case 'ArrowUp':
//             rightPaddle.position.y = Math.min(rightPaddle.position.y + paddleSpeed, 2.5 - paddleHeight / 2);
//             break;
//         case 'ArrowDown':
//             rightPaddle.position.y = Math.max(rightPaddle.position.y - paddleSpeed, -2.5 + paddleHeight / 2);
//             break;
//     }
// });

// // Topun yeniden başlaması için fonksiyon
// function resetBall() {
//     ball.position.set(0, 0, 0);
//     ballSpeedX = (Math.random() < 0.5 ? 1 : -1) * (0.01 + Math.random() * 0.02);
//     ballSpeedY = (Math.random() < 0.5 ? 1 : -1) * (0.01 + Math.random() * 0.02);
// }

// // Oyunu güncelleme fonksiyonu
// function animate() {
//     requestAnimationFrame(animate);

//     // Topu hareket ettirme
//     ball.position.x += ballSpeedX;
//     ball.position.y += ballSpeedY;

//     // Topun kenarlardan sekmesi
//     if (ball.position.y + ballRadius > 2.5 || ball.position.y - ballRadius < -2.5) {
//         ballSpeedY = -ballSpeedY;
//     }

//     // Topun paddles ile çarpışması
//     if ((ball.position.x - ballRadius < leftPaddle.position.x + paddleWidth / 2 && ball.position.x - ballRadius > leftPaddle.position.x - paddleWidth / 2 &&
//         ball.position.y < leftPaddle.position.y + paddleHeight / 2 && ball.position.y > leftPaddle.position.y - paddleHeight / 2)) {
//         ballSpeedX = -ballSpeedX;
//     }

//     if ((ball.position.x + ballRadius > rightPaddle.position.x - paddleWidth / 2 && ball.position.x + ballRadius < rightPaddle.position.x + paddleWidth / 2 &&
//         ball.position.y < rightPaddle.position.y + paddleHeight / 2 && ball.position.y > rightPaddle.position.y - paddleHeight / 2)) {
//         ballSpeedX = -ballSpeedX;
//     }

//     // Üst duvar çarpışması
//     if (ball.position.y + ballRadius > canvasHeight / 2 - wallHeight) {
//         ballSpeedY = -ballSpeedY;
//     }

//     // Alt duvar çarpışması
//     if (ball.position.y - ballRadius < -canvasHeight / 2 + wallHeight) {
//         ballSpeedY = -ballSpeedY;
//     }

//     // Topun sınırlardan geçmesi
//     if (ball.position.x - ballRadius < -4) {
//         scoreRight++;
//         resetBall();
//     } else if (ball.position.x + ballRadius > 4) {
//         scoreLeft++;
//         resetBall();
//     }

//     renderer.render(scene, camera);
// }

// resetBall(); // Oyunu başlatmadan önce topu sıfırla


// // Kuşbakışı açı


// // F tuşuna basıldığında açı değiştirme işlevi
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'f':
//             // camera.position.set(11, 0, 10); // Kamerayı uzakta ve yukarıda konumlandır
//             // camera.lookAt(0, 0, 0); // Kamerayı orijine bakacak şekilde ayarla
//             scene.rotation.set(1, -Math.PI / 2, 0);
//             break;
//     }
// });



// const views = [
//     { position: new THREE.Vector3(0, 0, 10), target: new THREE.Vector3(0, 0, 0) }, // Kuşbakışı açı
//     { position: new THREE.Vector3(5, 5, 5), target: new THREE.Vector3(0, 0, 0) },  // Yan çapraz açı
//     { position: new THREE.Vector3(0, 0, -5), target: new THREE.Vector3(0, 0, 0) }  // Paddle arkasından bakış açısı
// ];

// let currentViewIndex = 0;

// // Kamerayı belirli bir açıya ayarlayan fonksiyon
// function setCameraView(index) {
//     const { position, target } = views[index];
//     camera.position.copy(position);
//     camera.lookAt(target);
// }

// // Başlangıçta ilk açıyı ayarla
// setCameraView(currentViewIndex);

// // F tuşuna basıldığında açı değiştirme işlevi
// document.addEventListener('keydown', (event) => {
//     switch (event.key) {
//         case 'f':
//             currentViewIndex = (currentViewIndex + 1) % views.length; // Bir sonraki indekse geç
//             setCameraView(currentViewIndex); // Yeni açıyı ayarla
//             break;
//     }
// });



// export default function game() {
//     animate();
// }
