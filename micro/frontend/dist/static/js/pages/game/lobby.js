export default function lobby() {
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
   
    <!-- Turnuva oluşturma butonu -->
    <div style="text-align: center; margin-bottom: 10px;">
        <button id="startButton" class="btn btn-success">Start</button>
        <button id="stopButton" class="btn btn-danger">Stop</button>
        <button id="resetButton" class="btn btn-warning">Reset</button> <!-- Added Revenge button -->
    </div>


    <!-- Skor göstergesi -->
    <div id="scoreBoard" style="text-align: center; font-size: 24px; margin-bottom: 10px;">
      Player 1: <span id="scorePlayer1">0</span> | Player 2: <span id="scorePlayer2">0</span>
    </div>

    <!-- Oyun alanı canvas'ı -->
    <div id="canvasContainer" style="text-align: center; position: relative;">
      <!-- Canvas burada sonradan eklenecek -->
    </div>
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
    

} 