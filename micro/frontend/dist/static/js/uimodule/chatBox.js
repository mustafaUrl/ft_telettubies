import sendPostUserRequest from '../postwithjwt/userRequest.js';
import { getCookie } from '../cookies/cookies.js';
import { sendMessage } from '../utils/SocketHelper.js';
import sendPostWithJwt from '../postwithjwt/sendPostWithJwt.js';

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

export { updateNotificationButton, showTab2WithUsername, selectTab };
