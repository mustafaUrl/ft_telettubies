import game from './game.js';
import { getCookie } from '../../cookies/cookies.js';
import {startGame} from './start.js';
import  sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';

async function validateInviteCode(inviteCode) {
  try {
    const response = await sendPostWithJwt('api/user/validate_invite_code/', { invite_code: inviteCode }, 'POST');

    if (response.success) {
      const invitingUser = response.inviting_user;
      console.log('Invite code is valid. Inviting user:', invitingUser);
      return invitingUser;
    } else {
      alert('Invalid invite code.');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while validating the invite code:', error);
    alert('An error occurred while validating the invite code. Please try again later.');
    return null;
  }
}


export default function lobby() {
  // Select the main-content div
  const gameContainer = document.getElementById('main-content');
  const player1Name = getCookie('username');

  const htmlContent = `
  <div id="offcanvas-list" class="offcanvas offcanvas-start" tabindex="-1">
    <div class="offcanvas-header">
      <h5 class="offcanvas-title" id="offcanvasLabel">Game Lobby</h5>
      <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
      <!-- Online players list -->
      <div>
        <h6>Online Players</h6>
        <ul id="playerList" class="list-group mb-3">
          <!-- JavaScript dynamically filled -->
        </ul>
      </div>
      <!-- Room list -->
      <div>
        <h6>Rooms</h6>
        <ul id="roomList" class="list-group">
          <!-- JavaScript dynamically filled -->
        </ul>
      </div>
      <!-- Tournament section -->
      <div>
        <h6>Tournament</h6>
        <ul id="tournamentList" class="list-group">
          <!-- JavaScript dynamically filled -->
        </ul>
        <button id="createTournamentButton" class="btn btn-secondary" type="button">
          Create Tournament
        </button>
        <!-- Create Game button -->
        <button id="createGameButton" class="btn btn-primary" type="button" style="margin: 10px;">
          Create Game
        </button>
      </div>
    </div>
  </div>

  <!-- Sidebar open button -->
  <button id="openButton" class="btn btn-primary" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvas-list" aria-controls="offcanvas-list">
    Game Lobby
  </button>

  <!-- Game controls and scoreboard -->
  <div id="gameControls" style="text-align: center; margin-bottom: 10px; display: none;">
    <button id="startButton" class="btn btn-success">Start</button>
    <button id="stopButton" class="btn btn-danger">Stop</button>
    <button id="resetButton" class="btn btn-warning">Reset</button>
  </div>

  <!-- Scoreboard -->
  <div id="scoreBoard" style="text-align: center; font-size: 24px; margin-bottom: 10px; display: none;">
    <div>Player 1: <span id="scorePlayer1">0</span> | Player 2: <span id="scorePlayer2">0</span></div>
    <div>Game Mode: <span id="gameModeDisplay"></span></div>
  </div>

  <!-- Canvas container -->
  <div id="canvasContainer" style="text-align: center; position: relative;">
    <!-- Canvas will be added here -->
  </div>

  <!-- Winner popup modal -->
  <div id="winnerPopup" class="modal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Winner</h5>
        </div>
        <div class="modal-body">
          <p id="winnerMessage"></p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tournament creation modal -->
  <div id="tournamentModal" class="modal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Create Tournament</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
        <div class="mb-3">
            <label for="startTime" class="form-label">Start Time</label>
            <input type="datetime-local" class="form-control" id="startTime" required>
          </div>

          <form id="tournamentForm">
            <div class="mb-3">
              <label for="tournamentName" class="form-label">Tournament Name</label>
              <input type="text" class="form-control" id="tournamentName" required>
            </div>
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

  <!-- Game creation modal -->
  <div id="gameModal" class="modal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Create Game</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="gameForm">
          <div class="mb-3">
            <label for="gameMode" class="form-label">Game Mode</label>
            <select class="form-select" id="gameMode" required>
              <option value="normal">Normal Game</option>
              <option value="invited">Invited Game</option>
            </select>
          </div>
          <div class="mb-3" id="player2NameContainer">
            <label for="player2Name" class="form-label">Player 2 Name</label>
            <input type="text" class="form-control" id="player2Name" required>
          </div>
          <!-- Invite Code input for invited game mode -->
          <div class="mb-3" id="inviteCodeContainer" style="display: none;">
            <label for="inviteCode" class="form-label">Invite Code</label>
            <input type="text" class="form-control" id="inviteCode">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" id="submitGame" class="btn btn-primary">Create Game</button>
      </div>
    </div>
  </div>
</div>
`;



  // Set the inner HTML of the main-content
  gameContainer.innerHTML = htmlContent;

  document.getElementById('gameMode').addEventListener('change', function() {
    const gameMode = this.value;
    const inviteCodeContainer = document.getElementById('inviteCodeContainer');
  
    if (gameMode === 'invited') {
      inviteCodeContainer.style.display = 'block';
    } else {
      inviteCodeContainer.style.display = 'none';
    }
  });
  

  // Create Tournament Button
  document.getElementById('createTournamentButton').addEventListener('click', () => {
      const tournamentModal = new bootstrap.Modal(document.getElementById('tournamentModal'));
      tournamentModal.show();
  });





// Submit Tournament Button
document.getElementById('submitTournament').addEventListener('click', () => {
  const tournamentName = document.getElementById('tournamentName').value.trim();
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
  const startTimeInput = document.getElementById('startTime').value;
  const startTime = new Date(startTimeInput);

  if (startTimeInput === '') {
    alert('Start time cannot be empty.');
    return;
  }
  if (tournamentName === '') {
    alert('Tournament name cannot be empty.');
    return;
  }
  // Check if the start time is at least 2 minutes in the future
  const now = new Date();
  const minStartTime = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
  
 /*  if (startTime < minStartTime) {
    alert('Start time must be at least 2 minutes from now.');
    return;
  }  */

  if (numPlayers > 15 || numPlayers < 2) {
    alert('The number of players must be between 2 and 15.');
    return;
  }

  const playerNames = [];
  const usedNames = new Set(); // To store used names

  for (let i = 0; i < numPlayers; i++) {
    const playerName = document.getElementById(`playerName${i}`).value.trim(); // Trim whitespace

    // Check for empty names
    if (playerName === '') {
      alert('Player names cannot be empty.');
      return;
    }

    // Check for duplicate names
    if (usedNames.has(playerName)) {
      alert(`Duplicate player name found: ${playerName}. Player names must be unique.`);
      return;
    }

    playerNames.push(playerName);
    usedNames.add(playerName); // Add name to set to track uniqueness
  }

  const localDateTime = new Date(startTimeInput);
  const utcDateTime = localDateTime.toISOString(); // UTC'ye dönüştür
  console.log("utccccc" ,utcDateTime);

  if (window.chatSocket) {
    window.chatSocket.send(JSON.stringify({
      'playerNames': playerNames.join(', ') +', ' +player1Name, // Send player names to backend
      'username': player1Name, // Ensure you have the username defined
      'room': tournamentName, // Define the room name
      'command': 'create',
      'startTime': utcDateTime // Send start time to backend
    }));
  }

  // Close the modal after creating the tournament
  const tournamentModal = bootstrap.Modal.getInstance(document.getElementById('tournamentModal'));
  tournamentModal.hide();
});



// Update player name fields based on number of players
document.getElementById('numPlayers').addEventListener('input', () => {
  const numPlayersInput = document.getElementById('numPlayers');
  const playerNamesContainer = document.getElementById('playerNamesContainer');
  const numPlayers = parseInt(numPlayersInput.value);

  // Clear existing player name fields
  playerNamesContainer.innerHTML = '';

  // Wait for the user to finish inputting
  setTimeout(() => {
      // Check the current value after waiting
      const currentNumPlayers = parseInt(numPlayersInput.value);

      // Validate the number of players
      if (currentNumPlayers > 15) {
          alert('The maximum number of players is 15.');
          // Set the input value to 15 and return
          numPlayersInput.value = 15; // Set back to maximum allowed
          rebuildPlayerNameFields(15); // Rebuild with maximum allowed
          return;
      } else if (currentNumPlayers < 2) {
          alert('The minimum number of players is 2.');
          // Set the input value to 2 and return
          numPlayersInput.value = 2; // Set back to minimum allowed
          rebuildPlayerNameFields(2); // Rebuild with minimum allowed
          return;
      }

      // Rebuild player name fields with the current valid number of players
      rebuildPlayerNameFields(currentNumPlayers);
  }, 300); // Adjust the timeout duration as needed
});

function rebuildPlayerNameFields(numPlayers) {
  const playerNamesContainer = document.getElementById('playerNamesContainer');

  // Rebuild player name fields
  for (let i = 0; i < numPlayers; i++) {
      const playerNameDiv = document.createElement('div');
      playerNameDiv.className = 'mb-3';
      playerNameDiv.innerHTML = `
          <label for="playerName${i}" class="form-label">Player ${i + 1} Name</label>
          <input type="text" class="form-control" id="playerName${i}" required>
      `;
      playerNamesContainer.appendChild(playerNameDiv);
  }
}

  // Add event listener to Create Game button to open game creation modal
  document.getElementById('createGameButton').addEventListener('click', () => {
      const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
      gameModal.show();
  });


 
  document.getElementById('gameMode').addEventListener('change', function() {
    const gameMode = this.value;
    const inviteCodeContainer = document.getElementById('inviteCodeContainer');
    const player2NameContainer = document.getElementById('player2NameContainer');
    
    if (gameMode === 'invited') {
      inviteCodeContainer.style.display = 'block';
      player2NameContainer.style.display = 'none'; // Hide player2Name input
    } else {
      inviteCodeContainer.style.display = 'none';
      player2NameContainer.style.display = 'block'; // Show player2Name input
    }
  });
  
  document.getElementById('submitGame').addEventListener('click', async () => {
    const gameMode = document.getElementById('gameMode').value;
    let player2Name = document.getElementById('player2Name').value;
    let inviteCode = null;
  
    if (gameMode === 'invited') {
      inviteCode = document.getElementById('inviteCode').value;
      const invited = await validateInviteCode(inviteCode); // Await the promise
  
      if (!invited) {
        alert('Invalid invite code');
        return;
      }
      player2Name = invited;
    }
  
    if (player1Name === player2Name) {
      alert('Player names cannot be the same.');
      return;
    }
    if (!player1Name || !player2Name) {
      alert('Both player names are required.');
      return;
    }
  
    startGame(player1Name, player2Name, gameMode);
  
    // Close the modal after creating the game
    const gameModal = bootstrap.Modal.getInstance(document.getElementById('gameModal'));
    gameModal.hide();
  });
  
  




document.getElementById('resetButton').addEventListener('click', () => {
  const player2Name = document.getElementById('player2Name').value;
  const gameMode = document.getElementById('gameMode').value;

  

  
  if (player1Name === player2Name) {
    alert('Player names cannot be the same.');
    return;
  }
  if (!player1Name || !player2Name) {
    alert('Both player names are required.');
    return;
  }

  startGame(player1Name, player2Name, gameMode);

  // Close the modal after creating the game
  const gameModal = bootstrap.Modal.getInstance(document.getElementById('gameModal'));
  gameModal.hide();
});





}



