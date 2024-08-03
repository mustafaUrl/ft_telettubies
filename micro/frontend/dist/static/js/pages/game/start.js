import game from './game.js';
import { getCookie } from '../../cookies/cookies.js';

window.tournaments = {};

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

  if (tournamentData.currentMatch < tournamentData.teams.length) {
    const match = tournamentData.teams[tournamentData.currentMatch];
    console.log(`Starting Match: ${match[0]} vs ${match[1]}`);
    const round = `Round ${tournamentData.roundNumber}`;
    startGame(match[0], match[1], "tournament", tournamentName, tournamentData.roundNumber);
  } else {
    // Handling the case where there is a waiting player
    if (tournamentData.waitingPlayer) {
      // Only push waitingPlayer to winners if it's not the final round
      if (tournamentData.teams.length > 1) {
        tournamentData.winners.push(tournamentData.waitingPlayer);
        tournamentData.waitingPlayer = null;
      }
    }

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

      tournamentData.currentMatch = 0;
      tournamentData.roundNumber++;
      startNextMatch(tournamentName);
    } else if (tournamentData.winners.length === 1) {
      console.log(`Winner of the Tournament ${tournamentName}: ${tournamentData.winners[0]}`);
      alert(`Winner of the Tournament ${tournamentName}: ${tournamentData.winners[0]}`);
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


function startGame(player1Name, player2Name, gameMode, tournamentName = null, roundId = null, players = null) {
  function showWinner(winner) {
    const winnerPopup = new bootstrap.Modal(document.getElementById('winnerPopup'));
    document.getElementById('winnerMessage').textContent = `${winner} wins!`;
    winnerPopup.show();
    setTimeout(() => {
      winnerPopup.hide();
    }, 3000);
  }

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
