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
    canvas.id = 'gameCanvas'; 
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

    const scene = new THREE.Scene();


    const aspectRatio = canvasWidth / canvasHeight;
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 2000);
    camera.position.set(800, 21, 800); 
    camera.lookAt(0, 0, 0);

 
   const transparentMaterial = new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true });
   const neonEdgeMaterial = new THREE.LineBasicMaterial({ color: 0xff00ff });


   const playAreaGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight / 2 + 100);
   const playArea = new THREE.Mesh(playAreaGeometry, transparentMaterial);
   playArea.rotation.x = -Math.PI / 2;
   playArea.position.y = canvasHeight / 2 + 5; 
   playArea.position.z = 200; 

   const playAreaEdges = new THREE.EdgesGeometry(playAreaGeometry);
   const playAreaLines = new THREE.LineSegments(playAreaEdges, neonEdgeMaterial);
   playArea.add(playAreaLines);

   scene.add(playArea);

   const leftWallGeometry = new THREE.PlaneGeometry(canvasHeight / 2 + 100, canvasHeight);
   const leftWall = new THREE.Mesh(leftWallGeometry, transparentMaterial);
   leftWall.rotation.y = Math.PI / 2; 
   leftWall.position.x = -canvasWidth / 2; 
   leftWall.position.y = 1; 
   leftWall.position.z = 200; 

   const leftWallEdges = new THREE.EdgesGeometry(leftWallGeometry);
   const leftWallLines = new THREE.LineSegments(leftWallEdges, neonEdgeMaterial);
   leftWall.add(leftWallLines);

   scene.add(leftWall);

   const rightWallGeometry = new THREE.PlaneGeometry(canvasHeight / 2 + 100, canvasHeight);
   const rightWall = new THREE.Mesh(rightWallGeometry, transparentMaterial);
   rightWall.rotation.y = -Math.PI / 2; 
   rightWall.position.x = canvasWidth / 2; 
   rightWall.position.y = 1; 
   rightWall.position.z = 200; 

   const rightWallEdges = new THREE.EdgesGeometry(rightWallGeometry);
   const rightWallLines = new THREE.LineSegments(rightWallEdges, neonEdgeMaterial);
   rightWall.add(rightWallLines);

   scene.add(rightWall);

   const centerGroundGeometry = new THREE.PlaneGeometry(canvasWidth, canvasHeight);
   const centerGround = new THREE.Mesh(centerGroundGeometry, transparentMaterial);
   centerGround.position.y = 1; 
   centerGround.position.z = -30; 
   centerGround.position.x = 1;

   const centerGroundEdges = new THREE.EdgesGeometry(centerGroundGeometry);
   const centerGroundLines = new THREE.LineSegments(centerGroundEdges, neonEdgeMaterial);
   centerGround.add(centerGroundLines);

   scene.add(centerGround);

  const neonBlueMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff });

  const paddleWidth = 30;
  const paddleHeight = 150;
  const paddleDepth = 40;
  const paddleGeometry = new THREE.BoxGeometry(paddleWidth, paddleHeight, paddleDepth);

  // Create paddles
  const paddle1 = new THREE.Mesh(paddleGeometry, transparentMaterial);
  const paddle2 = new THREE.Mesh(paddleGeometry, transparentMaterial);

  const paddleEdges1 = new THREE.EdgesGeometry(paddleGeometry);
  const paddleLines1 = new THREE.LineSegments(paddleEdges1, neonBlueMaterial);
  paddle1.add(paddleLines1);

  const paddleEdges2 = new THREE.EdgesGeometry(paddleGeometry);
  const paddleLines2 = new THREE.LineSegments(paddleEdges2, neonBlueMaterial);
  paddle2.add(paddleLines2);

  paddle1.position.set(-canvasWidth / 2 + paddleWidth / 2, 0, 0);
  paddle2.position.set(canvasWidth / 2 - paddleWidth / 2, 0, 0);
  scene.add(paddle1);
  scene.add(paddle2);

 // Ball geometry and material
 const ballRadius = 20;
 const ballGeometry = new THREE.SphereGeometry(ballRadius, 32, 32);

 // Create a red and white checkerboard texture for the ball
 const checkerboardSize = 10;
 const canvasTexture = document.createElement('canvas');
 canvasTexture.width = checkerboardSize * 2;
 canvasTexture.height = checkerboardSize * 2;
 const ctx = canvasTexture.getContext('2d');

 ctx.fillStyle = '#ffffff';
 ctx.fillRect(0, 0, canvasTexture.width, canvasTexture.height);
 ctx.fillStyle = '#ff0000';
 ctx.fillRect(0, 0, checkerboardSize, checkerboardSize);
 ctx.fillRect(checkerboardSize, checkerboardSize, checkerboardSize, checkerboardSize);

 const ballTexture = new THREE.CanvasTexture(canvasTexture);
 const ballMaterial = new THREE.MeshBasicMaterial({ map: ballTexture });

 const ball = new THREE.Mesh(ballGeometry, ballMaterial);
 ball.position.set(0, 0, 0);
 scene.add(ball);

 
    let ballSpeed = 10;
    let ballDirection = new THREE.Vector3(1, 1, 0).normalize();

    
    const paddleMoveStep = 10;
    
    
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
            
            if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle1.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('s')) {
            
            if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle1.position.y -= paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowUp')) {
            
            if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle2.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowDown')) {
            
            if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle2.position.y -= paddleMoveStep;
            }
        }
        // Call the game loop again on the next frame
        requestAnimationFrame(gameLoop);
    }

   
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
        ballSpeed = 10; // Reset ball speed
    }

    // Define the game loop
    function gameLoop() {
        if (pressedKeys.has('w')) {
            
            if (paddle1.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle1.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('s')) {
            
            if (paddle1.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle1.position.y -= paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowUp')) {
            
            if (paddle2.position.y < canvasHeight / 2 - paddleHeight / 2) {
                paddle2.position.y += paddleMoveStep;
            }
        }
        if (pressedKeys.has('ArrowDown')) {
            
            if (paddle2.position.y > -canvasHeight / 2 + paddleHeight / 2) {
                paddle2.position.y -= paddleMoveStep;
            }
        }
        // Call the game loop again on the next frame
        gameLoopId = requestAnimationFrame(gameLoop);
    }
    let winScore = 3;

    function animate() {
        if (!gameRunning) return;
        animateId = requestAnimationFrame(animate);

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
            // showWinner(winner);
            gameRunning = false;
            resolve(winner); // Resolve the Promise with the winner
            return;
        } else if (scoreP2 === winScore) {
            winner = "Player 2";
            // showWinner(winner);
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

    
    gameRunning = false;

});
}