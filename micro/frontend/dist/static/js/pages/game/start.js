import game from './game.js';
import { getCookie } from '../../cookies/cookies.js';
import changeContent from '../../uimodule/changeContent.js';

window.tournaments = {};
function showPlayer(player1Name, player2Name) {
  const winnerPopup = new bootstrap.Modal(document.getElementById('PlayerPopup'));
  const message = `${player1Name} VS ${player2Name}`; 
  document.getElementById('PlayerMessage').textContent = `${message}!`;
  winnerPopup.show();

  // Pop-up'ı belirli bir süre sonra kapat
  setTimeout(() => {
    winnerPopup.hide();
  }, 3000);
}

function createTournament(tournamentName, playerNames) {
  console.log('Tournament created with players:', playerNames);
  const tournamentList = document.getElementById('tournamentList');
  tournamentList.innerHTML = '';

  const shuffledPlayers = shuffleArray(playerNames);
  console.log('Shuffled players:', shuffledPlayers);

  let waitingPlayer = null;
  if (shuffledPlayers.length % 2 !== 0) {
    waitingPlayer = shuffledPlayers.pop();
  }

  const teams = [];
  for (let i = 0; i < shuffledPlayers.length; i += 2) {
    const team = [shuffledPlayers[i], shuffledPlayers[i + 1]];
    teams.push(team);
  }

  window.tournaments[tournamentName] = {
    teams: teams,
    waitingPlayer: waitingPlayer,
    currentMatch: 0,
    winners: [],
    roundNumber: 1,
    status_start: ""
  };

  const tournamentItem = document.createElement('li');
  tournamentItem.className = 'list-group-item';
  tournamentItem.innerHTML = `
    <div>${tournamentName}</div>
    <ul id="matches-${tournamentName}">
      ${teams.map((team, index) => `<li id="match-${tournamentName}-${index}">Match ${index + 1}: ${team.join(' vs ')}</li>`).join('')}
      ${waitingPlayer ? `<li id="waiting-${tournamentName}">Waiting: ${waitingPlayer}</li>` : ''}
    </ul>
  `;
  tournamentList.appendChild(tournamentItem);

  startNextMatch(tournamentName);
}

function startNextMatch(tournamentName) {
  const tournamentData = window.tournaments[tournamentName];
  if (tournamentData.waitingPlayer) {
    tournamentData.winners.push(tournamentData.waitingPlayer);
    tournamentData.waitingPlayer = null;
  }

  if ( tournamentData.teams.length === 1 && tournamentData.winners.length === 0) {
    const match = tournamentData.teams[tournamentData.currentMatch];
    console.log(`Starting Final Match: ${match[0]} vs ${match[1]}`);
    startGame(match[0], match[1], "tournament", tournamentName, "Final");
  }
  else if (tournamentData.currentMatch < tournamentData.teams.length) {
    const match = tournamentData.teams[tournamentData.currentMatch];
    console.log(`Starting Match: ${match[0]} vs ${match[1]}`);
    
    startGame(match[0], match[1], "tournament", tournamentName, tournamentData.roundNumber);
  } else {
   

    if (tournamentData.winners.length > 1) {
      console.log(`Proceeding to next round with winners: ${tournamentData.winners}`);
      const winners = shuffleArray([...tournamentData.winners]);
      tournamentData.winners = [];
      tournamentData.teams = [];

      while (winners.length > 1) {
        const team = [winners.shift(), winners.shift()];
        tournamentData.teams.push(team);
      }

      if (winners.length === 1) {
        tournamentData.waitingPlayer = winners.shift();
      }

      tournamentData.currentMatch= 0;
      tournamentData.roundNumber++;
      startNextMatch(tournamentName);
    }
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function clearDisplay(tournamentName) {
  // Puanları sıfırla
  const scorePlayer1 = document.getElementById('scorePlayer1');
  const scorePlayer2 = document.getElementById('scorePlayer2');
  if (scorePlayer1) scorePlayer1.textContent = '';
  if (scorePlayer2) scorePlayer2.textContent = '';

  // Oyun modunu temizle
  const gameModeDisplay = document.getElementById('gameModeDisplay');
  if (gameModeDisplay) gameModeDisplay.textContent = '';

  // Skor tablosunu temizle
  const scoreBoardDiv = document.querySelector('#scoreBoard div');
  if (scoreBoardDiv) scoreBoardDiv.innerHTML = '';

  // Kontrol ve skor tablosunu gizle
  const gameControls = document.getElementById('gameControls');
  const scoreBoard = document.getElementById('scoreBoard');
  if (gameControls) gameControls.style.display = 'none';
  if (scoreBoard) scoreBoard.style.display = 'none';
  if (window.chatSocket) {
    window.chatSocket.send(JSON.stringify({
      'username': getCookie('username'),
      'room': tournamentName,
      'command': 'leave',
    }));
  }
  changeContent('game');
  
}





function startGame(player1Name, player2Name, gameMode, tournamentName = null, roundId = null, players = null) {
  function showWinner(winner) {
    const winnerPopup = new bootstrap.Modal(document.getElementById('winnerPopup'));
    const message = roundId === "Final" ? `Winner of the Tournament ${tournamentName}: ${winner}` : "Winner";
    document.getElementById('winnerMessage').textContent = `${message}!`;
    winnerPopup.show();
  
    // Pop-up kapanma olayına dinleyici ekleyin
    winnerPopup._element.addEventListener('hidden.bs.modal', function () {
      // Kapanma animasyonu tamamlandığında çalıştırılacak kod
      if (gameMode === "tournament") {
        if (roundId === "Final") {
          clearDisplay(tournamentName);
          
        }
      }
    });
  
    // Pop-up'ı belirli bir süre sonra kapat
    setTimeout(() => {
      winnerPopup.hide();
    }, 3000);
  }
  showPlayer(player1Name, player2Name);


  console.log(gameMode, 'Game started with players:', player1Name, player2Name);
  document.getElementById('scorePlayer1').textContent = '0';
  document.getElementById('scorePlayer2').textContent = '0';
  document.getElementById('gameModeDisplay').textContent = gameMode;

  document.querySelector('#scoreBoard div').innerHTML = `${player1Name}: <span id="scorePlayer1">0</span> | ${player2Name}: <span id="scorePlayer2">0</span>`;

  document.getElementById('gameControls').style.display = 'block';
  document.getElementById('scoreBoard').style.display = 'block';

  const matchResult = {
    player1_username: player1Name,
    player2_username: player2Name,
    player1_score: "",
    player2_score: "",
    winner_username: "",
    match_start_time: new Date().toISOString(),
    match_finish_time: "",
    game_mode: gameMode,
  };

  game().then((winner) => {
    console.log('Game finished');
    if (winner === "Player 1") {
      showWinner(player1Name);
      winner = player1Name;
    } else {
      showWinner(player2Name);
      winner = player2Name;
    }
    matchResult.winner_username = winner;
    matchResult.player1_score = document.getElementById('scorePlayer1').textContent;
    matchResult.player2_score = document.getElementById('scorePlayer2').textContent;
    matchResult.match_finish_time = new Date().toISOString();
    if (gameMode == "normal") {
      matchResult.player1_username = player1Name;
      matchResult.player2_username = player2Name + "(anonim)";
    } else if (gameMode == "invited") {
      matchResult.player1_username = player1Name;
      matchResult.player2_username = player2Name;
    } else {
      matchResult.player1_username = player1Name;
      matchResult.player2_username = player2Name;
      matchResult.tournament_name = tournamentName;
      matchResult.round_id = roundId;
      console.log("roundddd: ", roundId);
    }

    const accessToken = getCookie('accessToken');
    fetch('api/game/create/', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(matchResult)
    }).then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return response.json().then((errorData) => {
          const error = new Error('Error creating match');
          error.data = errorData;
          throw error;
        });
      }
    }).then((data) => {
      console.log('Match created successfully:', data);
      if (gameMode == "tournament") {
        window.tournaments[tournamentName].winners.push(winner);
        window.tournaments[tournamentName].currentMatch++;
        startNextMatch(tournamentName);
      }
    }).catch((error) => {
      console.error('Error creating match:', error.message);
      if (error.data) {
        console.error('Error details:', error.data.detail);
      }
    });
  }).catch((error) => {
    console.error('Error during the game:', error);
  });
}

export { startGame, createTournament, startNextMatch };
