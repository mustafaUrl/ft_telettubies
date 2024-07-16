import game from './game.js';
import { getCookie } from '../../cookies/cookies.js';
export default function lobby() {
  // Select the main-content div
  const gameContainer = document.getElementById('main-content');

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
            <!-- Player 2 name input based on game mode selection -->
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
  const tournamentName = document.getElementById('tournamentName').value.trim(); // Get tournament name
  const numPlayers = parseInt(document.getElementById('numPlayers').value);
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

  createTournament(tournamentName, playerNames);

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


// Attach startTournament function to the window object
window.startTournament = function(tournamentName) {
  console.log(`Starting tournament: ${tournamentName}`);
  const tournamentData = tournaments[tournamentName];
  startNextMatch(tournamentName, tournamentData);
};

// Tournament data storage
const tournaments = {};

// Tournament creation function
function createTournament(tournamentName, playerNames) {
  console.log('Tournament created with players:', playerNames);
  const tournamentList = document.getElementById('tournamentList');
  tournamentList.innerHTML = '';

  // Shuffle player names to randomize teams
  const shuffledPlayers = shuffleArray(playerNames);

  // If odd number of players, keep the last player in waiting
  let waitingPlayer = null;
  if (shuffledPlayers.length % 2 !== 0) {
    waitingPlayer = shuffledPlayers.pop();
  }

  // Create teams
  const teams = [];
  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    const team = [shuffledPlayers[i], shuffledPlayers[i + 1]];
    teams.push(team);
  }

  // Store tournament data
  tournaments[tournamentName] = {
    teams: teams,
    waitingPlayer: waitingPlayer,
    currentMatch: 0,
    winners: []
  };

  // Display tournament name and teams in tournament list
  const tournamentItem = document.createElement('li');
  tournamentItem.className = 'list-group-item';
  tournamentItem.innerHTML = `
    <div>${tournamentName}</div>
    <ul id="matches-${tournamentName}">
      ${teams.map((team, index) => `<li id="match-${tournamentName}-${index}">Match ${index + 1}: ${team[0]} vs ${team[1]}</li>`).join('')}
      ${waitingPlayer ? `<li id="waiting-${tournamentName}">Waiting: ${waitingPlayer}</li>` : ''}
    </ul>
    <button class="btn btn-primary" onclick="startTournament('${tournamentName}')">Start Tournament</button>
  `;
  tournamentList.appendChild(tournamentItem);
}


// Function to shuffle array (Fisher-Yates shuffle)
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// In the startNextMatch function
function startNextMatch(tournamentName, tournamentData) {
  // Check if there are still matches left
  if (tournamentData.currentMatch < tournamentData.teams.length) {
    const match = tournamentData.teams[tournamentData.currentMatch];
    const matchId = `match-${tournamentName}-${tournamentData.currentMatch}`;

    console.log(`Starting Match: ${match[0]} vs ${match[1]}`);
    startGame(match[0], match[1], tournamentName);
  } else {
    // Check if there are winners to proceed with
    if (tournamentData.winners.length > 1) {
      console.log(`Proceeding to next round with winners: ${tournamentData.winners}`);
      tournamentData.teams = [];
      
      // Create teams for the next round
      while (tournamentData.winners.length > 1) {
        const team = [tournamentData.winners.shift(), tournamentData.winners.shift()];
        tournamentData.teams.push(team);
      }
      
      // Handle the case if there's a waiting player
      if (tournamentData.winners.length === 1 && tournamentData.waitingPlayer) {
        tournamentData.teams.push([tournamentData.winners.pop(), tournamentData.waitingPlayer]);
        tournamentData.waitingPlayer = null;
      }
      
      tournamentData.currentMatch = 0; // Reset current match for the next round
      startNextMatch(tournamentName, tournamentData); // Start the next round
    } else {
      // Declare the winner of the tournament
      console.log(`Winner of the Tournament ${tournamentName}: ${tournamentData.winners[0]}`);
      alert(`Winner of the Tournament ${tournamentName}: ${tournamentData.winners[0]}`);
    }
  }
}



  // Add event listener to Create Game button to open game creation modal
  document.getElementById('createGameButton').addEventListener('click', () => {
      const gameModal = new bootstrap.Modal(document.getElementById('gameModal'));
      gameModal.show();
  });

 // Add event listener to submit game form
document.getElementById('submitGame').addEventListener('click', () => {
  const player2Name = document.getElementById('player2Name').value;
  const gameMode = document.getElementById('gameMode').value;
  let inviteCode = null;

  if (gameMode === 'invited') {
    inviteCode = document.getElementById('inviteCode').value;
    // Check if invite code is valid (for example, check if it's 42)
    if (inviteCode !== '42') {
      alert('Invalid invite code.');
      return;
    }
  }

  const player1Name = getCookie('username');
  
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


// Game creation function
function startGame(player1Name, player2Name, gameMode) {
  console.log(gameMode, 'Game started with players:', player1Name, player2Name);
  document.getElementById('scorePlayer1').textContent = '0';
  document.getElementById('scorePlayer2').textContent = '0';
  document.getElementById('gameModeDisplay').textContent = gameMode;

  document.querySelector('#scoreBoard div').innerHTML = `${player1Name}: <span id="scorePlayer1">0</span> | ${player2Name}: <span id="scorePlayer2">0</span>`;

  document.getElementById('gameControls').style.display = 'block';
  document.getElementById('scoreBoard').style.display = 'block';

  game().then(() => {
    const tournamentData = tournaments[gameMode]; // Adjust this to access the right tournament
    tournamentData.currentMatch++;
    startNextMatch(tournamentName, tournamentData);
  }).catch((error) => {
    console.error('Error during the game:', error);
  });
}


}
