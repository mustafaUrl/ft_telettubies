import * as THREE from 'three';

export default function game4() {
    // Canvas element properties
    const canvasWidth = 1300;
    const canvasHeight = 700;

    // Create the canvas element and set its properties
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.id = 'gameCanvas'; // Canvas'a id ekleyin
    canvas.style.display = 'block';
    canvas.style.margin = 'auto';
    canvas.style.position = 'absolute';
    canvas.style.top = '10px'; // Adjust this to move the canvas down if needed for the navbar height
    canvas.style.left = '0';
    canvas.style.right = '0';

    // Append the canvas to the canvasContainer
    document.getElementById('canvasContainer').appendChild(canvas);

    // WebGL renderer
    const renderer = new THREE.WebGLRenderer({ canvas });

    // Sahne oluşturma
    const scene = new THREE.Scene();

    // Kamera oluşturma
    const aspectRatio = canvasWidth / canvasHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
    camera.position.set(800, 21, 800); // Kamerayı daha uzak bir noktaya konumlandır
    camera.lookAt(0, 0, 0);

    // Oyun alanını boyamak için bir plane oluşturun
    const playAreaGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight / 2 + 100);
    const playAreaMaterial = new THREE.MeshBasicMaterial({ color: 0xf4a460, side: THREE.DoubleSide });
    const playArea = new THREE.Mesh(playAreaGeometry, playAreaMaterial);
    playArea.rotation.x = -Math.PI / 2; // X ekseni etrafında 90 derece döndür, böylece yatay olur
    playArea.position.y = canvasHeight / 2 + 5; // Oyun alanını biraz aşağıya koy, böylece paddle'lar üstünde durur
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
    const rightWallGeometry = new THREE.PlaneGeometry(canvasHeight / 2 + 100, canvasHeight);
    const rightWallMaterial = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide });
    const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
    rightWall.rotation.y = -Math.PI / 2; // Y ekseni etrafında -90 derece döndür, böylece dikey olur
    rightWall.position.x = canvasWidth / 2; // Oyun alanının sağ tarafında
    rightWall.position.y = 1; // Y ekseni boyunca merkezde
    rightWall.position.z = 200; // Oyun alanının ortasında
    // scene.add(rightWall);

    // Ortada bir zemin oluşturun
    const centerGroundGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
    const centerGroundMaterial = new THREE.MeshBasicMaterial({ color: 0xfffacd, side: THREE.DoubleSide });
    const centerGround = new THREE.Mesh(centerGroundGeometry, centerGroundMaterial);
    centerGround.position.y = 1; // Y ekseni boyunca merkezde
    centerGround.position.z = -30; // Oyun alanının ortasında
    centerGround.position.x = 1; // Oyun alanının ortasında
    scene.add(centerGround);

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

    // Yeni paddle'lar oluştur ve pozisyonlarını ayarla
    const paddle3 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    const paddle4 = new THREE.Mesh(paddleGeometry, paddleMaterial);

    const edges3 = new THREE.EdgesGeometry(paddleGeometry);
    const line3 = new THREE.LineSegments(edges3, edgeMaterial);
    paddle3.add(line3);

    const edges4 = new THREE.EdgesGeometry(paddleGeometry);
    const line4 = new THREE.LineSegments(edges4, edgeMaterial);
    paddle4.add(line4);

    // Yeni paddle'ları yatay hale getir ve pozisyonlarını ayarla
    paddle3.rotation.z = Math.PI / 2; // Yatay paddle
    paddle4.rotation.z = Math.PI / 2; // Yatay paddle

    paddle3.position.set(0, canvasHeight / 2 - paddleHeight / 2, 0); // Üst paddle
    paddle4.position.set(0, -canvasHeight / 2 + paddleHeight / 2, 0); // Alt paddle
    scene.add(paddle3);
    scene.add(paddle4);

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

    // Hareket miktarını ve klavye olaylarını sıklaştırma
    const paddleMoveStep = 4; // Her klavye olayında paddle'ın hareket edeceği adım miktarı

    // Klavye olaylarını dinle
    // Maintain a set of pressed keys
    const pressedKeys = new Set();
    let isCameraRotated = false; // Initialize camera rotation state
    let gameRunning = false; // Initialize game running state

    // Update the set on keydown
    document.addEventListener('keydown', (event) => {
        if (event.key === 'f') {
            // Toggle the camera rotation state
            isCameraRotated = !isCameraRotated;
        } else {
            pressedKeys.add(event.key);
        }
    });

    // Update the set on keyup
    document.addEventListener('keyup', (event) => {
        pressedKeys.delete(event.key);
    });

    // Skorları tutmak için değişkenler
    let scoreP1 = 0;
    let scoreP2 = 0;

    function updateScoreDisplay() {
        document.getElementById('scorePlayer1').textContent = scoreP1;
        document.getElementById('scorePlayer2').textContent = scoreP2;
    }

    let gameLoopId = null;
    let animateId = null;

    // Function to normalize and adjust the ball speed after collisions
    function normalizeBallSpeed() {
        const maxSpeed = 5; // Maximum speed the ball can have
        const minSpeed = 3; // Minimum speed the ball can have
        const currentSpeed = ballDirection.length();

        if (currentSpeed > maxSpeed) {
            ballDirection.setLength(maxSpeed);
        } else if (currentSpeed < minSpeed) {
            ballDirection.setLength(minSpeed);
        }
    }

    // Add functions to start, stop, and reset the game
    function startGame() {
        if (!gameRunning) {
            gameRunning = true;
            gameLoopId = requestAnimationFrame(gameLoop);
            animateId = requestAnimationFrame(animate);
        }
    }

    function stopGame() {
        if (gameRunning) {
            gameRunning = false;
            cancelAnimationFrame(gameLoopId);
            cancelAnimationFrame(animateId);
        }
    }

    function resetGame() {
        stopGame();
        ball.position.set(0, 0, 0);
        ballDirection.set(1, 1, 0).normalize();
        scoreP1 = 0;
        scoreP2 = 0;
        updateScoreDisplay();
    }

    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('stopButton').addEventListener('click', stopGame);
    document.getElementById('resetButtonn').addEventListener('click', resetGame);

    // Oyun döngüsü
    function gameLoop() {
        if (!gameRunning) return;

        // Paddle'ları hareket ettir
        if (pressedKeys.has('w') && paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
            paddle1.position.y += paddleMoveStep;
        }
        if (pressedKeys.has('s') && paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
            paddle1.position.y -= paddleMoveStep;
        }
        if (pressedKeys.has('ArrowUp') && paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
            paddle2.position.y += paddleMoveStep;
        }
        if (pressedKeys.has('ArrowDown') && paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
            paddle2.position.y -= paddleMoveStep;
        }
        if (pressedKeys.has('a') && paddle3.position.x > -canvasWidth / 2 + paddleWidth / 2) {
            paddle3.position.x -= paddleMoveStep;
        }
        if (pressedKeys.has('d') && paddle3.position.x < canvasWidth / 2 - paddleWidth / 2) {
            paddle3.position.x += paddleMoveStep;
        }
        if (pressedKeys.has('ArrowLeft') && paddle4.position.x > -canvasWidth / 2 + paddleWidth / 2) {
            paddle4.position.x -= paddleMoveStep;
        }
        if (pressedKeys.has('ArrowRight') && paddle4.position.x < canvasWidth / 2 - paddleWidth / 2) {
            paddle4.position.x += paddleMoveStep;
        }

        // Topun hareketini güncelle
        ball.position.add(ballDirection.clone().multiplyScalar(ballSpeed));

        // Paddle ile topun çarpışma algılaması
        if (
            ball.position.distanceTo(paddle1.position) < ballRadius + paddleHeight / 2 ||
            ball.position.distanceTo(paddle2.position) < ballRadius + paddleHeight / 2
        ) {
            ballDirection.reflect(new THREE.Vector3(0, 1, 0));
            normalizeBallSpeed();
        }

        if (
            ball.position.distanceTo(paddle3.position) < ballRadius + paddleWidth / 2 ||
            ball.position.distanceTo(paddle4.position) < ballRadius + paddleWidth / 2
        ) {
            ballDirection.reflect(new THREE.Vector3(1, 0, 0));
            normalizeBallSpeed();
        }

        // Oyun alanının kenarlarına çarpma kontrolü
        if (ball.position.y > canvasHeight / 2 - ballRadius || ball.position.y < -canvasHeight / 2 + ballRadius) {
            ballDirection.y *= -1;
        }

        if (ball.position.x > canvasWidth / 2 - ballRadius || ball.position.x < -canvasWidth / 2 + ballRadius) {
            ballDirection.x *= -1;
        }

        gameLoopId = requestAnimationFrame(gameLoop);
    }

    function animate() {
        if (isCameraRotated) {
            const radius = 1000; // Yörüngenin yarıçapı
            const angleSpeed = 0.01; // Kamera hareket hızı

            // Mevcut açıya göre kameranın yeni pozisyonunu hesapla
            const newX = camera.position.x * Math.cos(angleSpeed) - camera.position.z * Math.sin(angleSpeed);
            const newZ = camera.position.x * Math.sin(angleSpeed) + camera.position.z * Math.cos(angleSpeed);

            camera.position.set(newX, camera.position.y, newZ);
            camera.lookAt(0, 0, 0);
        }

        // Kamerayı sahnenin merkezine bakacak şekilde ayarla
        camera.lookAt(scene.position);

        // Render the scene
        renderer.render(scene, camera);

        if (gameRunning) {
            animateId = requestAnimationFrame(animate);
        }
    }
}
