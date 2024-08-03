import { getCookie, setCookie } from '../cookies/cookies.js';
import  {createTournament}  from '../pages/game/start.js';
import { get_notifications_count } from '../uimodule/notifications.js';
import { inviteUser } from '../uimodule/chatBox.js';
import viewProfile from '../utils/view-profile.js ';
import {listFriends,} from '../pages/profile/profile_utils.js';
import {checkBlocked} from '../utils/SocketHelper.js';
import sendPostUserRequest from '../postwithjwt/userRequest.js';
window.chatSocket = '';

async function get_banned_user(username) {
  try {
    const response = await sendPostUserRequest('get_banned');
    console.log('Response:', response); // Log the entire response

    // Ensure response is in the expected format
    if (!response || !Array.isArray(response.blocked_users)) {
      throw new Error('Invalid response structure');
    }

    const bannedUsers = response.blocked_users;
    console.log('Banned users:', bannedUsers);

    // Check if the specified username is in the list of banned users
    const isBanned = bannedUsers.some(user => user.username === username);
    console.log('Is user banned:', isBanned, typeof isBanned);

    return isBanned; // Return the result

  } catch (error) {
    console.error('Processing error:', error);
    return false; // Ensure a boolean value is returned
  }
}


function isTournamentStarted(tournament) {
  return window.tournaments[tournament] && window.tournaments[tournament].status_start === 'started';
}


export default  function openSocket() {
  if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
    return;
  }

  window.chatSocket = new WebSocket(`wss://${window.location.host}/ws/chat/?token=` + getCookie('accessToken'));

  window.chatSocket.onmessage = async function(e) {
    const data = JSON.parse(e.data);
    console.log('type:', data.type, 'data:', data);
    if (data.type !== "online_players" && data.type !== "tournaments") {
      checkBlocked(data.username);
    }
    if (data.type === "online_players") {
      updateOnlinePlayers(data.players);
    }else if (data.type === 'tournaments') {
      updateLobbyTournaments(data.tournaments);
      updateKickButtons();
      updateTournamentButtons();

    }
    else if (!data.type === 'invite_notification') {
      get_notifications_count();
    }
    else if (data.type === 'tournament_message') {
      
        const chatMessages = document.getElementById('chat_messages1');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'my-message';
        messageDiv.textContent = data.message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
      else {
        const deger = await get_banned_user(data.username);
        console.log('deger:', deger, 'type:', typeof deger);
        if (!deger) {
          const chatMessages = document.getElementById('chat_messages1');
          const messageDiv = document.createElement('div');
          
          // Create a dropdown button
          const dropdownButton = document.createElement('button');
          dropdownButton.textContent = '⋮'; // More options icon
          dropdownButton.className = 'dropdown-button';
      
          // Create dropdown menu
          const dropdownMenu = document.createElement('div');
          dropdownMenu.className = 'chat-dropdown-menu';
          dropdownMenu.innerHTML = `
            <li><a class="dropdown-item view-profile-btn" href="#" data-username="${data.username}">View Profile</a></li>
            <li><a class="dropdown-item invite-player-btn" href="#" data-username="${data.username}">Invite Player</a></li>
          `;
      
          // Append dropdown menu to the button
          dropdownButton.appendChild(dropdownMenu);
      
          // Toggle dropdown menu on button click
          dropdownButton.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the click from propagating to the document
            dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
          });
      
          // Handle view profile click
          dropdownMenu.querySelector('.view-profile-btn').addEventListener('click', function(event) {
            event.preventDefault();
            viewProfile(data.username);
          });
      
          // Handle invite player click
          dropdownMenu.querySelector('.invite-player-btn').addEventListener('click', function(event) {
            event.preventDefault();
            inviteUser(data.username);
          });
      
          // Add username, message text, and dropdown button to the message div
          const usernameSpan = document.createElement('span');
          usernameSpan.textContent = data.username;
          usernameSpan.className = 'username-text';
      
          const messageText = document.createTextNode(`: ${data.message} `);
      
          messageDiv.appendChild(dropdownButton);
          messageDiv.appendChild(usernameSpan);
          messageDiv.appendChild(messageText);
      
          // Append message to chat
          chatMessages.appendChild(messageDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        }
        
    };
  
    // Close dropdown menu when clicking outside
  document.addEventListener('click', function(event) {
    const dropdowns = document.querySelectorAll('.chat-dropdown-menu');
    dropdowns.forEach(dropdown => {
      dropdown.style.display = 'none';
    });
  });

  window.chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
  };

  function updateOnlinePlayers(players) {
    setCookie('onlinePlayers', JSON.stringify(players));
    listFriends();
    const playerList = document.getElementById('playerList');
    if (!playerList) {
        return;
    }
    playerList.innerHTML = ''; // Clear existing player list

    players.forEach(player => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item';

        // Create player name text node
        const playerText = document.createTextNode(player);
        listItem.appendChild(playerText);

        if (player !== getCookie('username')) {
// Create invite button
const inviteButton = document.createElement('button');
inviteButton.textContent = 'Invite';
inviteButton.className = 'btn btn-primary btn-sm';
inviteButton.addEventListener('click', () => inviteUser(player));

// Append button to the list item
listItem.appendChild(inviteButton);
        }
        // Append list item to the player list
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

function updateLobbyTournaments(tournaments) {
  const tournamentList = document.getElementById('tournamentList');
  if (!tournamentList) {
      return;
  }
  tournamentList.innerHTML = '';

  const username = getCookie('username');

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
        console.log('aynennnn:',  details.players);
        if (details.host === getCookie('username')) {
          if ( !isTournamentStarted(tournament)) {
            window.tournaments[tournament] = { status_start: 'started'};          
            createTournament(tournament, details.players);
        }}
       
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
}



