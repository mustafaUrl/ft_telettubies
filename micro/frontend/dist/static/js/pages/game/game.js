import * as THREE from 'three';

export default function game() {
    // Select the main-content div
    const gameContainer = document.getElementById('main-content');

    // HTML content to be added
    const htmlContent = `
    <div id="offcanvas-list" class="offcanvas offcanvas-start" tabindex="-1">
      <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasLabel">Game Lobby</h5>
          <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      <div class="offcanvas-body">
          <!-- Online oyuncular listesi -->
          <div>
              <h6>Online Players</h6>
              <ul id="playerList" class="list-group mb-3">
                  <!-- JavaScript ile dinamik olarak doldurulacak -->
              </ul>
          </div>
          <!-- Oda listesi -->
          <div>
              <h6>Rooms</h6>
              <ul id="roomList" class="list-group">
                  <!-- JavaScript ile dinamik olarak doldurulacak -->
              </ul>
          </div>
          <div>
            <h6>Tournament</h6>
            <button id="createTournamentButton" class="btn btn-secondary" type="button">
                Create Tournament
            </button>

            <ul id="tournamentList" class="list-group">
                <!-- JavaScript ile dinamik olarak doldurulacak -->
            </ul>
        </div>
      </div>
    </div>

    <!-- Sidebar'ı açacak buton -->
    <button id="openButton" class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-list" aria-controls="offcanvas-list">
      Game Lobby
    </button>

    <!-- Turnuva oluşturma butonu -->
   
    <div style="text-align: center; margin-bottom: 10px;">
      <button id="startButton" class="btn btn-success">Start</button>
      <button id="stopButton" class="btn btn-danger">Stop</button>
    </div>

    <!-- Skor göstergesi -->
    <div id="scoreBoard" style="text-align: center; font-size: 24px; margin-bottom: 10px;">
      Player 1: <span id="scorePlayer1">0</span> | Player 2: <span id="scorePlayer2">0</span>
    </div>

    <!-- Oyun alanı canvas'ı -->
    <div id="canvasContainer" style="text-align: center; position: relative;">
      <!-- Canvas burada sonradan eklenecek -->
    </div>

    <!-- Tournament modal -->
    <div id="tournamentModal" class="modal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Create Tournament</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="tournamentForm">
              <div class="mb-3">
                <label for="numPlayers" class="form-label">Number of Players</label>
                <input type="number" class="form-control" id="numPlayers" required>
              </div>
              <div id="playerNamesContainer"></div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" id="submitTournament" class="btn btn-primary">Create</button>
          </div>
        </div>
      </div>
    </div>
    `;

    // Set the inner HTML of the main-content
    gameContainer.innerHTML = htmlContent;

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


    document.getElementById('createTournamentButton').addEventListener('click', () => {
        const tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
        tournamentModal.show();
    });
    
    // Tournament form submit event
    document.getElementById('submitTournament').addEventListener('click', () => {
        const numPlayers = parseInt(document.getElementById('numPlayers').value);
        if (numPlayers > 15) {
            alert('The maximum number of players is 15.');
            return;
        }
    
        const playerNames = [];
        for (let i = 0; i < numPlayers; i++) {
            const playerName = document.getElementById(`playerName${i}`).value;
            playerNames.push(playerName);
        }
        createTournament(playerNames);
    
        // Close the modal after creating the tournament
        const tournamentModal = bootstrap.Modal.getInstance(document.getElementById('tournamentModal'));
        tournamentModal.hide();
    });
    
    // Update player name fields based on number of players
    document.getElementById('numPlayers').addEventListener('input', () => {
        const numPlayers = parseInt(document.getElementById('numPlayers').value);
        const playerNamesContainer = document.getElementById('playerNamesContainer');
        playerNamesContainer.innerHTML = '';
    
        if (numPlayers > 15) {
            alert('The maximum number of players is 15.');
            document.getElementById('numPlayers').value = 15;
            const tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
            tournamentModal.show(); // Reopen the modal after alert
    
            for (let i = 0; i < 15; i++) {
                const playerNameDiv = document.createElement('div');
                playerNameDiv.className = 'mb-3';
                playerNameDiv.innerHTML = `
                    <label for="playerName${i}" class="form-label">Player ${i + 1} Name</label>
                    <input type="text" class="form-control" id="playerName${i}" required>
                `;
                playerNamesContainer.appendChild(playerNameDiv);
            }
            return;
        }
    
        for (let i = 0; i < numPlayers; i++) {
            const playerNameDiv = document.createElement('div');
            playerNameDiv.className = 'mb-3';
            playerNameDiv.innerHTML = `
                <label for="playerName${i}" class="form-label">Player ${i + 1} Name</label>
                <input type="text" class="form-control" id="playerName${i}" required>
            `;
            playerNamesContainer.appendChild(playerNameDiv);
        }
    });
    
    // Tournament creation function
    function createTournament(playerNames) {
        console.log('Tournament created with players:', playerNames);
        const tournamentList = document.getElementById('tournamentList');
        tournamentList.innerHTML = '';
    
        const shuffledPlayers = playerNames.sort(() => 0.5 - Math.random());
        const halfSize = Math.ceil(shuffledPlayers.length / 2);
        const teams = [
            shuffledPlayers.slice(0, halfSize),
            shuffledPlayers.slice(halfSize)
        ];
    
        teams.forEach((team, index) => {
            const teamItem = document.createElement('li');
            teamItem.className = 'list-group-item';
            teamItem.innerText = `Team ${index + 1}: ${team.join(', ')}`;
            tournamentList.appendChild(teamItem);
        });
    }
    

    
    // Animasyon döngüsü
    function animate() {
        if (!gameRunning) return;
        requestAnimationFrame(animate);

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

        // Render the scene and camera
        renderer.render(scene, camera);

        // Call the animation loop again on the next frame
    }

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

    document.getElementById('startButton').addEventListener('click', () => {
        if (gameRunning) return; // If the game is already running, return
        gameRunning = true;
        gameLoop(); // Start the game loop
        animate(); // Start the animation loop
    });

    document.getElementById('stopButton').addEventListener('click', () => {
        gameRunning = false; // Stop the game
    });

    // Start with the game paused
    gameRunning = false;
}