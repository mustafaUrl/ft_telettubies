import { getCookie } from '../cookies/cookies.js';

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
    } else if (data.type === 'tournaments') {
      const tournaments = data.tournaments;
      const tournamentList = document.getElementById('tournamentList');
      tournamentList.innerHTML = '';

   
      // Collect host information
      const username = getCookie('username');
      let isUserHost = false;

      for (const [tournament, details] of Object.entries(tournaments)) {
        const startTimeUtc = new Date(data.start_time[tournament]);
        const localStartTime = startTimeUtc.toLocaleString(); 
        const currentTime = new Date();
        const joinTime = startTimeUtc > currentTime;
    
        // Check if the user is already a participant
        const userJoined = details.players.includes(username);
    
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
            <h4>${tournament} (Host: ${details.host})</h4>
            <h7>Start Time: ${localStartTime}</h7>
            <ul id="participantList">
                ${details.players.map(name => `
                    <li>
                        ${name} 
                        ${username === details.host && name !== details.host ? `<button class="btn btn-danger btn-sm float-right kickPlayerButton" data-tournament="${tournament}" data-player="${name}">X</button>` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
    
        // Conditionally add Join and Leave buttons
        if (joinTime && !userJoined) {
            li.innerHTML += `<button class="btn btn-primary joinTournamentButton" data-tournament="${tournament}">Join Tournament</button>`;
        }
        if (userJoined) {
            li.innerHTML += `<button class="btn btn-danger leaveTournamentButton" data-tournament="${tournament}">Leave Tournament</button>`;
        } else if (!joinTime) {
            li.innerHTML += '<h7>Join Time is Over</h7>';
        }
    
        // Add Start button for the host after the join time is over
        if (!joinTime && username === details.host) {
          const startButton = document.createElement('button');
          startButton.className = 'btn btn-success startTournamentButton';
          startButton.dataset.tournament = tournament;
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
      
    } else {
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
