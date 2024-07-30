import game from './game.js';
import { getCookie } from '../../cookies/cookies.js';

export default function startGame(player1Name, player2Name, gameMode, tournamentName = null , roundId = null) {


function showWinner(winner) {
    const winnerPopup = new bootstrap.Modal(document.getElementById('winnerPopup'));
    document.getElementById('winnerMessage').textContent = `${winner} wins!`;
    winnerPopup.show();
    
    setTimeout(() => {
        winnerPopup.hide();
    }, 3000); // 3 saniye sonra pop-up'ı gizle
   
  }
  
    console.log(gameMode, 'Game started with players:', player1Name, player2Name);
    document.getElementById('scorePlayer1').textContent = '0';
    document.getElementById('scorePlayer2').textContent = '0';
    document.getElementById('gameModeDisplay').textContent = gameMode;
  
    document.querySelector('#scoreBoard div').innerHTML = `${player1Name}: <span id="scorePlayer1">0</span> | ${player2Name}: <span id="scorePlayer2">0</span>`;
  
    document.getElementById('gameControls').style.display = 'block';
    document.getElementById('scoreBoard').style.display = 'block';
  
    const matchResult = {
      tournament_name: "",
      player1_username: player1Name,
      player2_username: player2Name,
      player1_score: "",
      player2_score: "",
      winner_username: "",
      match_start_time: new Date().toISOString(),
      match_finish_time: "",
    };
    console.log('gamemode : ', gameMode);  
  

      game().then((winner) => {
        if (gameMode !== 'normal' && gameMode !== 'invited') {
            console.error('Invalid game mode:', gameMode);
            return;
            }
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
        console.log('Match Result:', matchResult);
        if (gameMode == "normal") {
          matchResult.player1_username = player1Name;
          matchResult.player2_username = player2Name + "(anonim)";
        } else if (gameMode == "invited") {
          matchResult.player1_username = player1Name;
          matchResult.player2_username = player2Name;
        } else {
          matchResult.player1_username = player1Name;
          matchResult.player2_username = player2Name;
          matchResult.tournament_name = gameMode;
        }
  
        const accessToken = getCookie('accessToken'); // Assuming the cookie name is 'accessToken'
        console.log('Access Token:', accessToken);
        fetch('api/game/create/', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(matchResult)
        }).then((response) => {
          if (response.ok) {
            console.log('Match created successfully');
          } else {
            console.error('Error creating match:', response.statusText);
          }
        }).catch((error) => {
          console.error('Error creating match:', error);
        });
      }).catch((error) => {
        console.error('Error during the game:', error);
      });
    
  }
  
  
  
  
  