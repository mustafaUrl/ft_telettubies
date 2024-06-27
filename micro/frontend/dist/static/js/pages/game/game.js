import * as THREE from 'three';

export default function game() {
    // Sabit canvas boyutları
    const canvasWidth = 1300;
    const canvasHeight = 800;

    // Canvas elementini oluşturun ve tarayıcıya ekleyin
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
    canvas.style.position = 'absolute';
    canvas.style.top = '50px'; // Navbar yüksekliği için ayar yapabilirsiniz
    canvas.style.bottom = '0';
    canvas.style.left = '0';
    canvas.style.right = '0';

    const gameContainer = document.getElementById('main-content');
    gameContainer.innerHTML = '';
    gameContainer.appendChild(canvas);

    // WebGL renderer oluşturun ve canvas elementini kullanın
    const renderer = new THREE.WebGLRenderer({ canvas });

    // Sahne oluşturma
    const scene = new THREE.Scene();

    // Kamera oluşturma
    const aspectRatio = canvasWidth / canvasHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
    camera.position.set(800, 21, 800); // Kamerayı daha uzak bir noktaya konumlandır
    camera.lookAt(0, 0, 0);

    // Başlangıçta kamera açısının değiştirilmediği durumu tutan değişken
    let isCameraRotated = false;

   // Oyun alanını boyamak için bir plan oluşturun
// const playAreaGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
// const playAreaMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
// const playArea = new THREE.Mesh(playAreaGeometry, playAreaMaterial);
// playArea.rotation.x = -Math.PI / 2; // X ekseni etrafında 90 derece döndür, böylece yatay olur
// playArea.position.y = -canvasHeight / 2; // Oyun alanını biraz aşağıya koy, böylece paddle'lar üstünde durur
// scene.add(playArea);

//   Oyun alanını boyamak için bir plane oluşturun
const playAreaGeometry = new THREE.PlaneGeometry(canvasWidth , canvasHeight / 2 + 100);
const playAreaMaterial = new THREE.MeshBasicMaterial({ color: 0xf4a460, side: THREE.DoubleSide });
const playArea = new THREE.Mesh(playAreaGeometry, playAreaMaterial);
playArea.rotation.x = -Math.PI / 2; // X ekseni etrafında 90 derece döndür, böylece yatay olur
playArea.position.y = canvasHeight / 2  + 5; // Oyun alanını biraz aşağıya koy, böylece paddle'lar üstünde durur
playArea.position.z = 200; // Oyun alanının ortasında
scene.add(playArea);

// Sol kenara zemin eklemek için bir plane oluşturun
const leftWallGeometry = new THREE.PlaneGeometry(canvasHeight / 2 + 100, canvasHeight);
const leftWallMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
leftWall.rotation.y = Math.PI / 2; // Y ekseni etrafında 90 derece döndür, böylece dikey olur
leftWall.position.x = -canvasWidth / 2; // Oyun alanının sol tarafında
leftWall.position.y = 1; // Y ekseni boyunca merkezde
leftWall.position.z = 200; // Oyun alanının ortasında
scene.add(leftWall);

// Sağ kenara zemin eklemek için bir plane oluşturun
const rightWallGeometry = new THREE.PlaneGeometry(canvasHeight / 2 + 100 , canvasHeight);
const rightWallMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
rightWall.rotation.y = -Math.PI / 2; // Y ekseni etrafında -90 derece döndür, böylece dikey olur
rightWall.position.x = canvasWidth / 2; // Oyun alanının sağ tarafında
rightWall.position.y = 1; // Y ekseni boyunca merkezde
rightWall.position.z = 200; // Oyun alanının ortasında
scene.add(rightWall);

// Ortada bir zemin oluşturun
const centerGroundGeometry = new THREE.PlaneGeometry(canvasWidth , canvasHeight );
const centerGroundMaterial = new THREE.MeshBasicMaterial({ color: 0xfffacd, side: THREE.DoubleSide });
const centerGround = new THREE.Mesh(centerGroundGeometry, centerGroundMaterial);
centerGround.position.y = 1; // Y ekseni boyunca merkezde
centerGround.position.z = -30; // Oyun alanının ortasında
centerGround.position.x = 1; // Oyun alanının ortasında
scene.add(centerGround);


// // Arkaya zemin eklemek için bir plane oluşturun
// const backWallGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
// const backWallMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
// const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
// backWall.rotation.x = -Math.PI / 2; // X ekseni etrafında 90 derece döndür, böylece yatay olur
// backWall.position.z = canvasHeight / 2; // Oyun alanının arkasında
// backWall.position.y = 0; // Y ekseni boyunca merkezde
// scene.add(backWall);

    // Paddle'ların geometri ve malzemelerini ayarla
    const paddleWidth = 30; // Canvas genişliğine göre paddle genişliğini ayarla
    const paddleHeight = 150; // Paddle yüksekliği
    const paddleDepth = 40; // Paddle derinliği
    const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0xf0e6ff });

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xff1500 });
    // Paddle'ları oluştur ve pozisyonlarını ayarla
    const paddle1 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);

    const edges1 = new THREE.EdgesGeometry(paddleGeometry);
    const line1 = new THREE.LineSegments(edges1, edgeMaterial);
    paddle1.add(line1);

    const edges2 = new THREE.EdgesGeometry(paddleGeometry);
    const line2 = new THREE.LineSegments(edges2, edgeMaterial);
    paddle2.add(line2);

    paddle1.position.set(-canvasWidth / 2 + paddleWidth / 2, 0, 0); // Sol paddle
    paddle2.position.set(canvasWidth / 2 - paddleWidth / 2, 0, 0); // Sağ paddle
    scene.add(paddle1);
    scene.add(paddle2);

    // Topun geometri ve malzemesini ayarla
    const ballRadius = 20;
    const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);
    const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ball = new THREE.Mesh(ballGeometry, ballMaterial);
    ball.position.set(0, 0, 0); // Topun başlangıç pozisyonu
    scene.add(ball);

    // Topun hızını ve yönünü ayarla (ilk olarak topu hareket ettir)
    let ballSpeed = 5;
    let ballDirection = new THREE.Vector3(1, 1, 0).normalize();

    // Skorları tutmak için değişkenler
    let scoreP1 = 0;
    let scoreP2 = 0;

    // Hareket miktarını ve klavye olaylarını sıklaştırma
    const paddleMoveStep = 50; // Her klavye olayında paddle'ın hareket edeceği adım miktarı

    // Klavye olaylarını dinle
    document.addEventListener('keydown', (event) => {
        switch (event.key) {
            case 'f':
                isCameraRotated = !isCameraRotated; // F tuşuna basıldığında kamera durumunu değiştir
                break;
            case 'w':
                // Sol paddle'ı yukarı hareket ettir
                if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
                    paddle1.position.y += paddleMoveStep;
                }
                break;
            case 's':
                // Sol paddle'ı aşağı hareket ettir
                if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                    paddle1.position.y -= paddleMoveStep;
                }
                break;
            case 'ArrowUp':
                // Sağ paddle'ı yukarı hareket ettir
                if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
                    paddle2.position.y += paddleMoveStep;
                }
                break;
            case 'ArrowDown':
                // Sağ paddle'ı aşağı hareket ettir
                if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                    paddle2.position.y -= paddleMoveStep;
                }
                break;
            default:
                break;
        }
    });

    // Animasyon döngüsü
    function animate() {
        requestAnimationFrame(animate);

        // Kamera açısını değiştirme
        if (isCameraRotated) {
            camera.position.set(0, -900, 150); // Kamerayı yana çevir
            camera.lookAt(0, 0, 0);
            camera.rotation.x = Math.PI / 2;

        } else {
            camera.position.set(0, 0, 800); // Kamerayı x ekseninde konumlandır
            camera.lookAt(0, 0, 0); // Merkez noktaya bak

            // Kamerayı 90 derece döndürmek için x rotasyonunu sıfırla
            camera.rotation.set(0, 0, 0);
        }

        // Topu hareket ettir
        ball.position.add(ballDirection.clone().multiplyScalar(ballSpeed));

        // Topun sınırları kontrol et ve eğer sınıra çarparsa yönünü tersine çevir
        if (ball.position.y + ballRadius > canvasHeight / 2) {
            // Üst sınıra çarpma kontrolü
            ballDirection.setY(ballDirection.y * -1);
        } else if (ball.position.y - ballRadius < -canvasHeight / 2) {
            // Alt sınıra çarpma kontrolü
            ballDirection.setY(ballDirection.y * -1);
        }

        // Topun pedallara çarpma kontrolü
        if (ball.position.x + ballRadius > paddle2.position.x - paddleWidth / 2 &&
            ball.position.x - ballRadius < paddle2.position.x + paddleWidth / 2 &&
            ball.position.y + ballRadius > paddle2.position.y - paddleHeight / 2 &&
            ball.position.y - ballRadius < paddle2.position.y + paddleHeight / 2) {
            // Sağ pedala çarpma
            ballDirection.setX(ballDirection.x * -1);
            ballDirection.setY((ball.position.y - paddle2.position.y) / (paddleHeight / 2));
        } else if (ball.position.x - ballRadius < paddle1.position.x + paddleWidth / 2 &&
            ball.position.x + ballRadius > paddle1.position.x - paddleWidth / 2 &&
            ball.position.y + ballRadius > paddle1.position.y - paddleHeight / 2 &&
            ball.position.y - ballRadius < paddle1.position.y + paddleHeight / 2) {
            // Sol pedala çarpma
            ballDirection.setX(ballDirection.x * -1);
            ballDirection.setY((ball.position.y - paddle1.position.y) / (paddleHeight / 2));
        }

        // Topun sahayı terk etme kontrolü ve skor güncelleme
        if (ball.position.x + ballRadius > canvasWidth / 2) {
            // Sağ sınırdan çıktı, sol oyuncu puan kazanır
            scoreP1++;
            resetBall();
        } else if (ball.position.x - ballRadius < -canvasWidth / 2) {
            // Sol sınırdan çıktı, sağ oyuncu puan kazanır
            scoreP2++;
            resetBall();
        }

        // Sahneyi ve kamerasını güncelle
        renderer.render(scene, camera);
    }

    
// Topu başlangıç pozisyonuna ve rastgele yön ve hızla yerleştir
function resetBall() {
    ball.position.set(0, 0, 0);
    // Rastgele yön seçimi
    let randomAngle = Math.random() * Math.PI - Math.PI / 2; // -π/2 ile π/2 arasında rastgele açı
    ballDirection.set(Math.cos(randomAngle), Math.sin(randomAngle), 0).normalize();
}


animate();
}





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
//         camera.position.set(1, 800, 11); // Kamerayı yana çevir
//         camera.lookAt(0, 0, 0);
//         camera.rotation.x = -Math.PI / 2;
//     } else {
//         camera.position.set(0, 0, 800); // Kamerayı x ekseninde konumlandır
//         camera.lookAt(0, 0, 0); // Merkez noktaya bak

//         // Kamerayı 90 derece döndürmek için x rotasyonunu sıfırla
//         camera.rotation.set(0, 0, 0); 

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

// export default function game() {
//     // Canvas elementini oluşturun ve tarayıcıya ekleyin
//     const canvas = document.createElement('canvas');
//     canvas.style.display = 'block';
//     canvas.style.margin = 'auto';
//     canvas.style.position = 'absolute';
//     canvas.style.top = '0';
//     canvas.style.bottom = '0';
//     canvas.style.left = '0';
//     canvas.style.right = '0';
//     document.body.appendChild(canvas);

//     // WebGL renderer oluşturun ve canvas elementini kullanın
//     const renderer = new THREE.WebGLRenderer({ canvas });

//     // Sahne oluşturma
//     const scene = new THREE.Scene();

//     // Kamera oluşturma
//     const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
//     camera.position.z = 5;

//     // Canvas boyutlarını ayarlayın
//     const canvasWidth = window.innerWidth;
//     const canvasHeight = window.innerHeight;
//     renderer.setSize(canvasWidth, canvasHeight);

//     // Dikdörtgen kutu oluşturma
//     const geometry = new THREE.BoxGeometry(1, 1, 1); // Genişlik, yükseklik ve derinlik
//     const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); // Yeşil renkli malzeme
//     const cube = new THREE.Mesh(geometry, material);
//     scene.add(cube);

//     // Animasyon döngüsü
//     function animate() {
//         requestAnimationFrame(animate);
//         cube.rotation.x += 0.01;
//         cube.rotation.y += 0.01;
//         renderer.render(scene, camera);
//     }

//     // Tarayıcı yenilendiğinde sahneyi güncelleyin
//     window.addEventListener('resize', () => {
//         const width = window.innerWidth;
//         const height = window.innerHeight;
//         renderer.setSize(width, height);
//         camera.aspect = width / height;
//         camera.updateProjectionMatrix();
//     });

//     animate();
// }
