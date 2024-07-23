
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

      for (const [tournament, details] of Object.entries(tournaments)) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.innerHTML = `
          <h5>${tournament} (Host: ${details.host})</h5>
          <ul id="participantList">
            ${details.players.map(name => `<li>${name}</li>`).join('')}
          </ul>
          <button class="btn btn-primary joinTournamentButton" data-tournament="${tournament}">Join Tournament</button>
          <button class="btn btn-danger leaveTournamentButton" data-tournament="${tournament}">Leave Tournament</button>
        `;
        tournamentList.appendChild(li);
      }

      // Reapply event listeners
      updateTournamentButtons();
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
      console.log('Join Tournament button clicked for:', tournamentName);

      if (window.chatSocket) {
        window.chatSocket.send(JSON.stringify({
          'message': "test", // Get sender's username,
          'username': getCookie('username'),
          'room': tournamentName,
          'command': 'join',
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
          'message': "test", // Get sender's username,
          'username': getCookie('username'),
          'room': tournamentName,
          'command': 'leave',
        }));
      }
    });
  });
}
