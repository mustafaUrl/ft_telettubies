import sendPostUserRequest from '../postwithjwt/userRequest.js';
import { getCookie } from '../cookies/cookies.js';
import { sendMessage } from '../utils/SocketHelper.js';
import sendPostWithJwt from '../postwithjwt/sendPostWithJwt.js';
import changeContent from './changeContent.js';
import drawWinLoseChart from '../utils/drawChart.js'; 
window.activeTab = 'tab1';

function selectTab(selectedTabId) {
  window.unreadCount = 0;
  const unreadCountElement = document.getElementById('unread_count');
  unreadCountElement.textContent = '';
  unreadCountElement.style.display = 'none'; // Hide count

  const tabs = document.querySelectorAll('#tabs > div');
  tabs.forEach(function(tab) {
    tab.style.backgroundColor = '';
    tab.style.color = '';
  });

  const selectedTab = document.getElementById(selectedTabId);
  selectedTab.style.backgroundColor = '#0d61d7';
  selectedTab.style.color = 'black';

  document.getElementById('chat_messages1').style.display = selectedTabId === 'tab1' ? 'block' : 'none';
  document.getElementById('chat_messages2').style.display = selectedTabId === 'tab2' ? 'block' : 'none';
  window.activeTab = selectedTabId;
}

function showTab2WithUsername(username) {
  const tab2 = document.getElementById('tab2');
  tab2.textContent = username;
  tab2.style.display = 'block';
  selectTab('tab2');
}

function updateNotificationButton(username) {
  const notificationButton = document.getElementById('notification_button');
  notificationButton.textContent = `New messages (${username})`;
  notificationButton.style.display = 'block';
}

document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  const username = getCookie('username');

  if (chatSocketPrivate && window.activeTab === 'tab2') {
    sendMessage(message);
    showTab2WithUsername(window.otherUser);
  } else {
    if (window.chatSocket) {
      window.chatSocket.send(JSON.stringify({
        'message': message,
        'username': username,
        'room': 'global',
        'command': 'message'
      }));
    }
  }
  messageInput.value = '';
};

document.getElementById('chat_icon').addEventListener('click', function() {
  toggleFriendList();
});

document.getElementById('chat_bar').addEventListener('click', function() {
  var chatContainer = document.getElementById('chat_container');
  var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';

  chatContainer.style.height = isClosed ? '285px' : '0px';
  this.style.bottom = isClosed ? '310px' : '10px';
});

document.getElementById('chat_input').onkeypress = function(e) {
  if (e.keyCode === 13) {
    document.getElementById('chat_send').click();
  }
};

function toggleFriendList() {
  var friendList = document.getElementById('friend-list');
  var chatContainer = document.getElementById('chat_container');
  var chatBar = document.getElementById('chat_bar');
  var chatIcon = document.getElementById('chat_icon');

  var isFriendListVisible = friendList.style.display === 'block';

  friendList.style.display = isFriendListVisible ? 'none' : 'block';

  chatContainer.style.right = isFriendListVisible ? '10px' : '250px';
  chatBar.style.right = isFriendListVisible ? '10px' : '250px';
  chatIcon.style.right = isFriendListVisible ? '330px' : '600px';
  if (!isFriendListVisible) {
    fetchAndDisplayFriends();
  }
}

function fetchAndDisplayFriends() {
  sendPostUserRequest('list_friends')
    .then(data => {
      const friends = data.friends;
      displayFriends(friends);
    })
    .catch(error => {
      console.error('Friend list could not be retrieved:', error);
    });
}

function updateNotificationCount(username, count) {
  const userLink = document.querySelector(`[data-username="${username}"]`);
  let notificationSpan = userLink.querySelector('.notification-count');
  
  if (!notificationSpan) {
    notificationSpan = document.createElement('span');
    notificationSpan.classList.add('notification-count');
    userLink.appendChild(notificationSpan);
  }
  
  if (count > 0) {
    notificationSpan.textContent = count;
    notificationSpan.style.display = 'block';
  } else {
    notificationSpan.style.display = 'none';
  }
}
function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = '';

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-item');
  
    friendElement.innerHTML = `
      <p>
        <img src="${friend.profile_picture}" alt="${friend.username}" class="profile-picture">
        <span class="username-btn" data-username="${friend.username}">${friend.username}</span>
        <div class="dropdown">
          <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton-${friend.username}" data-bs-toggle="dropdown" aria-expanded="false">
            <span class="dropdown-arrow">▼</span>
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${friend.username}">
            <li><a class="dropdown-item view-profile-btn" href="#" data-username="${friend.username}">View Profile</a></li>
            <li><a class="dropdown-item invite-btn" href="#" data-username="${friend.username}">Invite</a></li>
          </ul>
        </div>
      </p>`;
  
    friendListContainer.appendChild(friendElement);
  });

  document.querySelectorAll('.dropdown-toggle').forEach(dropdownToggleEl => {
    new bootstrap.Dropdown(dropdownToggleEl);
  });

  document.querySelectorAll('.view-profile-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      changeContent('view_profile');
      const username = this.getAttribute('data-username');
      viewProfile(username);
    });
  });

  document.querySelectorAll('.invite-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      const username = this.getAttribute('data-username');
      inviteUser(username);
    });
  });

  document.querySelectorAll('.username-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      const username = this.getAttribute('data-username');
      if (window.otherUser !== username) {
        window.otherUser = username;
      }
      selectTab('tab2');
      var chatContainer = document.getElementById('chat_container');
      var chatBar = document.getElementById('chat_bar');
      chatContainer.style.height = '285px';
      chatBar.style.bottom = '310px';
    });
  });
}



function viewProfile(username) {
  console.log(`Viewing profile of ${username}`);
  sendPostWithJwt('api/user/view_profile/', { username }, 'POST')
    .then(response => {
      console.log('Profile viewed:', response);

      const profileContainer = document.getElementById('view-container');
      if (!profileContainer) {
        console.error('Profile container not found in the DOM.');
        return;
      }

      // Access profile fields directly from response
      const profile = response;

      profileContainer.innerHTML = `
        <div class="container mt-4">
          <div class="row">
            <div class="col-md-4 text-center">
              <div class="profile-picture-container">
                <img src="${profile.profile_picture}" alt="${profile.username}" class="img-fluid rounded-circle" style="width: 150px; height: 150px; object-fit: cover;">
              </div>
            </div>
            <div class="col-md-8">
              <div class="profile-details">
                <h4>${profile.username}</h4>
                <p><strong>First Name:</strong> ${profile.first_name}</p>
                <p><strong>Last Name:</strong> ${profile.last_name}</p>
                <p><strong>Email:</strong> ${profile.email}</p>
              </div>
            </div>
          </div>
        </div>`;

      profileContainer.style.display = 'block';
      
      const url = 'api/user/get_match_history/';
  const bodyData = { username:profile.username  }; // Include username in the body
  const method = 'POST'; // Use GET method as defined in the Django view

  sendPostWithJwt(url, bodyData, method).then(matchHistory => {
   

    let wins = 0;
    let losses = 0;

    matchHistory.forEach(match => {
      if (match.winner_username === profile.username) { // Replace 'current_user' with the actual username
        wins++;
      } else {
        losses++;
      }
    });

    profileContainer.innerHTML += `
      <div>
        <h3>Win-Lose Stats</h3>
        <canvas id="winLoseChart" width="800" height="600"></canvas>
      </div>
    `;

    drawWinLoseChart(wins, losses);
  }).catch(error => {
    console.error('An error occurred while fetching match history:', error);
  });
    })
    .catch(error => {
      console.error('An error occurred while viewing profile:', error);
    });

  
}



function inviteUser(username) {
  const message = `I wanna play with you ${username}`;
  console.log(`Inviting ${username} with message: ${message}`);
  
  sendPostWithJwt('api/user/invite_user/', {username}, 'POST')
    .then(response => {
      console.log('Invitation sent:', response);
      window.chatSocket.send(JSON.stringify({
        'message': message,
        'username': getCookie('username'),
        'room': 'global',
        'command': 'update_notification',
      }));
    })
    .catch(error => {
      console.error('An error occurred while sending invitation:', error);
    });
}

export { updateNotificationButton, showTab2WithUsername, selectTab, inviteUser };
