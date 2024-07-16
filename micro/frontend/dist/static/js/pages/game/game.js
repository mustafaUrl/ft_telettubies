import * as THREE from 'three';

export default function game() {
    return new Promise((resolve) => {
    let winner = null;
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

    // Your Three.js setup code here...

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
    scene.add(rightWall);

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

    // Define the game loop
    function gameLoop() {
        if (pressedKeys.has('w')) {
            // Sol paddle'ı yukarı hareket ettir
            if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle1.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('s')) {
            // Sol paddle'ı aşağı hareket ettir
            if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle1.position.y -= paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowUp')) {
            // Sağ paddle'ı yukarı hareket ettir
            if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle2.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowDown')) {
            // Sağ paddle'ı aşağı hareket ettir
            if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle2.position.y -= paddleMoveStep;
            }
        }
        // Call the game loop again on the next frame
        requestAnimationFrame(gameLoop);
    }

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
        const maxSpeed = 5; // Maximum speed threshold
        const minSpeed = 1.3; // Minimum speed threshold

        // Calculate current speed
        let currentSpeed = ballDirection.length();

        // Adjust speed if it exceeds maximum or falls below minimum
        if (currentSpeed > maxSpeed) {
            ballDirection.normalize().multiplyScalar(maxSpeed); // Cap the speed
        } else if (currentSpeed < minSpeed) {
            ballDirection.normalize().multiplyScalar(minSpeed); // Maintain minimum speed
        }
    }

    // Reset the ball to the starting position with a random direction and speed
    function resetBall() {
        ball.position.set(0, 0, 0);
        // Select a random direction
        let randomAngle = Math.random() * Math.PI - Math.PI / 2; // Random angle between -π/2 and π/2
        ballDirection.set(Math.cos(randomAngle), Math.sin(randomAngle), 0).normalize();
        ballSpeed = 4; // Reset ball speed
    }

    // Define the game loop
    function gameLoop() {
        if (pressedKeys.has('w')) {
            // Sol paddle'ı yukarı hareket ettir
            if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle1.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('s')) {
            // Sol paddle'ı aşağı hareket ettir
            if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle1.position.y -= paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowUp')) {
            // Sağ paddle'ı yukarı hareket ettir
            if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle2.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowDown')) {
            // Sağ paddle'ı aşağı hareket ettir
            if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle2.position.y -= paddleMoveStep;
            }
        }
        // Call the game loop again on the next frame
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    let winScore = 3;
    // Animasyon döngüsü
    function animate() {
        if (!gameRunning) return;
        animateId = requestAnimationFrame(animate);

        // Change camera angle
        if (isCameraRotated) {
            camera.position.set(0, -900, 150); // Rotate the camera
            camera.lookAt(0, 0, 0);
            camera.rotation.x = Math.PI / 2;
        } else {
            camera.position.set(0, 0, 800); // Position the camera on the x-axis
            camera.lookAt(0, 0, 0); // Look at the center point
            camera.rotation.set(0, 0, 0); // Reset rotation
        }

        // Move the ball
        ball.position.add(ballDirection.clone().multiplyScalar(ballSpeed));

        // Check for ball collisions with the boundaries and reverse direction if necessary
        if (ball.position.y + ballRadius > canvasHeight / 2) {
            ballDirection.setY(ballDirection.y * -1); // Top boundary collision
            ball.position.y = canvasHeight / 2 - ballRadius; // Adjust position to be within bounds
        } else if (ball.position.y - ballRadius < -canvasHeight / 2) {
            ballDirection.setY(ballDirection.y * -1); // Bottom boundary collision
            ball.position.y = -canvasHeight / 2 + ballRadius; // Adjust position to be within bounds
        }

        // Check for ball collisions with paddles
        if (ball.position.x + ballRadius > paddle2.position.x - paddleWidth / 2 &&
            ball.position.x - ballRadius < paddle2.position.x + paddleWidth / 2 &&
            ball.position.y + ballRadius > paddle2.position.y - paddleHeight / 2 &&
            ball.position.y - ballRadius < paddle2.position.y + paddleHeight / 2) {
            // Right paddle collision
            ballDirection.setX(ballDirection.x * -1);
            ballDirection.setY((ball.position.y - paddle2.position.y) / (paddleHeight / 2));
            ball.position.x = paddle2.position.x - paddleWidth / 2 - ballRadius; // Adjust position to be within bounds
            normalizeBallSpeed();
        } else if (ball.position.x - ballRadius < paddle1.position.x + paddleWidth / 2 &&
            ball.position.x + ballRadius > paddle1.position.x - paddleWidth / 2 &&
            ball.position.y + ballRadius > paddle1.position.y - paddleHeight / 2 &&
            ball.position.y - ballRadius < paddle1.position.y + paddleHeight / 2) {
            // Left paddle collision
            ballDirection.setX(ballDirection.x * -1);
            ballDirection.setY((ball.position.y - paddle1.position.y) / (paddleHeight / 2));
            ball.position.x = paddle1.position.x + paddleWidth / 2 + ballRadius; // Adjust position to be within bounds
            normalizeBallSpeed();
        }

        // Check if the ball has left the field and update scores
        if (ball.position.x + ballRadius > canvasWidth / 2) {
            // Right boundary exit, left player scores
            scoreP1++;
            updateScoreDisplay();
            resetBall();
        } else if (ball.position.x - ballRadius < -canvasWidth / 2) {
            // Left boundary exit, right player scores
            scoreP2++;
            updateScoreDisplay();
            resetBall();
        }

        if (scoreP1 === winScore) {
            winner = "Player 1";
            showWinner(winner);
            gameRunning = false;
            resolve(winner); // Resolve the Promise with the winner
            return;
        } else if (scoreP2 === winScore) {
            winner = "Player 2";
            showWinner(winner);
            gameRunning = false;
            resolve(winner); // Resolve the Promise with the winner
            return;
        }
        // Render the scene and camera
        renderer.render(scene, camera);

        // Call the animation loop again on the next frame
    }

    document.getElementById('startButton').addEventListener('click', () => {
        if (gameRunning) return; // If the game is already running, return
        gameRunning = true;
        gameLoop(); // Start the game loop
        animate(); // Start the animation loop
    });

    document.getElementById('stopButton').addEventListener('click', () => {
        gameRunning = false; // Stop the game

        // Cancel the animation frames
        if (gameLoopId) {
            cancelAnimationFrame(gameLoopId);
            gameLoopId = null;
        }
        if (animateId) {
            cancelAnimationFrame(animateId);
            animateId = null;
        }
    });

    document.getElementById('resetButton').addEventListener('click', () => {
        // Reset scores
        scoreP1 = 0;
        scoreP2 = 0;
        updateScoreDisplay();
        
        // Reset the ball
        resetBall();
        
        // Restart the game
        gameRunning = true;
        gameLoop(); // Restart the game loop
        animate(); // Restart the animation loop
    });

    function showWinner(winner) {
        const winnerPopup = new bootstrap.Modal(document.getElementById('winnerPopup'));
        document.getElementById('winnerMessage').textContent = `${winner} wins!`;
        winnerPopup.show();
        
        setTimeout(() => {
            winnerPopup.hide();
        }, 3000); // 3 saniye sonra pop-up'ı gizle
       
    }
    
    // Start with the game paused
    gameRunning = false;

});
}
