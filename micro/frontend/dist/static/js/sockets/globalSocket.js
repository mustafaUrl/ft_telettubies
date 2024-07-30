import { getCookie } from '../cookies/cookies.js';
import  startGame  from '../pages/game/start.js';
window.chatSocket = '';

export default function openSocket() {
  if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
    return;
  }

  window.chatSocket = new WebSocket(`wss://${window.location.host}/ws/chat/?token=` + getCookie('accessToken'));

  window.chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('type:', data.type, 'data:', data);
    if (data.type === "online_players") {
      updateOnlinePlayers(data.players);
    }else if (data.type === 'tournaments') {
      const tournaments = data.tournaments;
      const tournamentList = document.getElementById('tournamentList');
      if (!tournamentList) {
          return;
      }
      tournamentList.innerHTML = '';
  
      const username = getCookie('username');
      console.log('Data:', data); // Debug data structure
  
      for (const [tournament, details] of Object.entries(tournaments)) {
          console.log('Tournament:', tournament, 'Details:', details);  
          const startTimeUtc = new Date(details.start_time);
          const localStartTime = startTimeUtc.toLocaleString();
          const currentTime = new Date();
          console.log('Current Time:', currentTime, 'Start Time:', startTimeUtc, 'Local Start Time:', localStartTime);
          const joinTime = startTimeUtc > currentTime;
  
          const userJoined = details.players.includes(username);
          const checkTime = startTimeUtc - currentTime;
          console.log('Check Time:', checkTime);
  
          if (checkTime > 0) {
              setTimeout(() => {
                  console.log('Scheduled check time function executed!');
                  checkTimeFunction();
              }, checkTime);
          }
  
          const li = document.createElement('li');
          li.className = 'list-group-item';
  
          let playerListHtml = '';
          let roundsHtml = '';
  
          if (details.status === 'started') {
              console.log('details', details);
              if (Object.keys(details.rounds).length > 0) {
                  roundsHtml = `
                      <h5>Rounds:</h5>
                      ${Object.entries(details.rounds).map(([round, matches]) => `
                          <div>
                              <h6>${round}</h6>
                              <ul>
                                  ${matches.map(match => {
                                      // Check if match is an array before using join
                                      if (Array.isArray(match) && match.length === 2) {
                                          return `
                                              <li>${match.join(' vs ')} 
                                                  <button class="btn btn-primary btn-sm playButton" data-tournament="${tournament}" data-player1="${match[0]}" data-player2="${match[1]}">Play</button>
                                              </li>
                                          `;
                                      } else {
                                          // Handle cases where match is not a player array
                                          return '';
                                      }
                                  }).join('')}
                              </ul>
                          </div>
                      `).join('')}
                      <h5>Waiting Players:</h5>
                      <ul>
                        ${details.waiting_player ? `<li>${details.waiting_player}</li>` : '<li>No waiting player</li>'}
                      </ul>
                  `;
              } else {
                  roundsHtml = '<p>No rounds available.</p>';
              }
          } else {
              playerListHtml = `
                  <ul id="participantList">
                      ${(details.players || []).map(name => `
                          <li>
                              ${name} 
                              ${username === details.host && name !== details.host ? `<button class="btn btn-danger btn-sm float-right kickPlayerButton" data-tournament="${tournament}" data-player="${name}">X</button>` : ''}
                          </li>
                      `).join('')}
                  </ul>
              `;
          }
  
          li.innerHTML = `
              <h4>${tournament} (Host: ${details.host})</h4>
              <h7>Start Time: ${localStartTime}</h7>
              ${roundsHtml}
              ${playerListHtml}
          `;
  
          if (joinTime && !userJoined) {
              li.innerHTML += `<button class="btn btn-primary joinTournamentButton" data-tournament="${tournament}">Join Tournament</button>`;
          }
          if (userJoined) {
              li.innerHTML += `<button class="btn btn-danger leaveTournamentButton" data-tournament="${tournament}">Leave Tournament</button>`;
          } else if (!joinTime) {
              li.innerHTML += '<h7>Join Time is Over</h7>';
          }
  
          if (!joinTime && username === details.host && details.status !== 'started') {
              const startButton = document.createElement('button');
              startButton.className = 'btn btn-success startTournamentButton';
              startButton.dataset.tournament = tournament;
              startButton.dataset.rounds = details.rounds;
              startButton.textContent = 'Start Tournament';
              startButton.addEventListener('click', () => {
                  if (window.chatSocket) {
                      window.chatSocket.send(JSON.stringify({
                          'username': getCookie('username'),
                          'room': tournament,
                          'command': 'start',
                      }));
                  }
              });
              li.appendChild(startButton);
          }
  
          tournamentList.appendChild(li);
      }
  
      // Reapply event listeners for join and leave buttons
      updateTournamentButtons();
      updateKickButtons();
  
      // Add event listeners for play buttons
      const playButtons = document.querySelectorAll('.playButton');
      playButtons.forEach(button => {
          button.addEventListener('click', (event) => {
              const player1 = event.target.dataset.player1;
              const player2 = event.target.dataset.player2;
              const tournament_name = event.target.dataset.tournament;
              const rounds = event.target.dataset.rounds;
              console.log('ronddddd ', rounds);
              startGame(player1, player2, "tournament", tournament_name);
          });
      });
  }
   
else {
      const chatMessages = document.getElementById('chat_messages1');
      const messageDiv = document.createElement('div');
      messageDiv.textContent = data.username + ': ' + data.message;
      chatMessages.appendChild(messageDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  };

  window.chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
  };

  function updateOnlinePlayers(players) {
    const playerList = document.getElementById('playerList');
    if (!playerList) {
      return;
    }
    playerList.innerHTML = ''; // Clear existing player list

    players.forEach(player => {
      const listItem = document.createElement('li');
      listItem.textContent = player;
      listItem.className = 'list-group-item';
      playerList.appendChild(listItem);
    });
  }
}

function updateTournamentButtons() {
  document.querySelectorAll('.joinTournamentButton').forEach(button => {
    button.addEventListener('click', (event) => {
        const tournamentName = event.target.getAttribute('data-tournament');
        console.log('Join Tournament button clicked for:', tournamentName, "time: ", new Date().getTime());

        if (window.chatSocket) {
            window.chatSocket.send(JSON.stringify({
                'username': getCookie('username'),
                'room': tournamentName,
                'command': 'join',
                'currentTime': new Date().getTime()  // Milisaniye cinsinden UTC zamanı
            }));
        }
    });
});


  document.querySelectorAll('.leaveTournamentButton').forEach(button => {
    button.addEventListener('click', (event) => {
      const tournamentName = event.target.getAttribute('data-tournament');
      console.log('Leave Tournament button clicked for:', tournamentName);

      if (window.chatSocket) {
        window.chatSocket.send(JSON.stringify({
          'username': getCookie('username'),
          'room': tournamentName,
          'command': 'leave',
        }));
      }
    });
  });
}

function updateKickButtons() {
  document.querySelectorAll('.kickPlayerButton').forEach(button => {
    button.addEventListener('click', (event) => {
      const tournamentName = event.target.getAttribute('data-tournament');
      const playerName = event.target.getAttribute('data-player');
      console.log('Kick Player button clicked for:', playerName, 'in tournament:', tournamentName);

      if (window.chatSocket) {
        window.chatSocket.send(JSON.stringify({
          'username': getCookie('username'),
          'room': tournamentName,
          'command': 'kick',
          'target': playerName,
        }));
      }
    });
  });
}


function checkTimeFunction() {
  if (window.chatSocket) {
    window.chatSocket.send(JSON.stringify({
      'username': getCookie('username'),
      'room': 'test',
      'command': 'online_players'
    }));
  }
}


