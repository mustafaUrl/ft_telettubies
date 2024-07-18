import sendPostUserRequest from '../postwithjwt/userRequest.js';
import { getCookie } from '../cookies/cookies.js';
import { sendMessage } from '../utils/SocketHelper.js';

let activeTab = 'tab1';
function selectTab(selectedTabId) {
    // Reset tab styles
    const tabs = document.querySelectorAll('#tabs > div');
    tabs.forEach(function(tab) {
      tab.style.backgroundColor = '';
      tab.style.color = '';
    });
  
    // Set selected tab style
    const selectedTab = document.getElementById(selectedTabId);
    selectedTab.style.backgroundColor = '#0d61d7';
    selectedTab.style.color = 'black';
  
    // Adjust visibility of message boxes
    document.getElementById('chat_messages1').style.display = selectedTabId === 'tab1' ? 'block' : 'none';
    document.getElementById('chat_messages2').style.display = selectedTabId === 'tab2' ? 'block' : 'none';
    activeTab = selectedTabId;
}

function showTab2WithUsername(username) {
  const tab2 = document.getElementById('tab2');
  tab2.textContent = username; // Update tab 2 text
  tab2.style.display = 'block'; // Show tab 2
  selectTab('tab2'); // Select tab 2
}

// Update notification button function
function updateNotificationButton(username) {
  const notificationButton = document.getElementById('notification_button');
  notificationButton.textContent = `New messages (${username})`;
  notificationButton.style.display = 'block'; // Show notification button
}

document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  const username = getCookie('username'); // Get sender's username

  if (chatSocketPrivate && activeTab === 'tab2') {
    sendMessage(message);
    showTab2WithUsername(window.otherUser);
  } else {
    // Send message via WebSocket
    if (window.chatSocket) {
      window.chatSocket.send(JSON.stringify({
        'message': message,
        'username': username,
        'room': 'global'
      }));
    }
  }
  messageInput.value = '';
};

// Listen to icon click event and show friend list
document.getElementById('chat_icon').addEventListener('click', function() {
  toggleFriendList(); // This function should be defined earlier
  // fetchAndDisplayFriends();
});

document.getElementById('chat_bar').addEventListener('click', function() {
  var chatContainer = document.getElementById('chat_container');
  var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';

  // Update chat window height and gray bar bottom position
  chatContainer.style.height = isClosed ? '285px' : '0px';
  this.style.bottom = isClosed ? '310px' : '10px'; // Update chatBar with 'this'
});

document.getElementById('chat_input').onkeypress = function(e) {
  if (e.keyCode === 13) {  // Enter key
    document.getElementById('chat_send').click();
  }
};

// Toggle chat box function
function toggleFriendList() {
  var friendList = document.getElementById('friend-list');
  var chatContainer = document.getElementById('chat_container');
  var chatBar = document.getElementById('chat_bar');
  var chatIcon = document.getElementById('chat_icon');

  var isFriendListVisible = friendList.style.display === 'block';

  // Toggle friend list visibility
  friendList.style.display = isFriendListVisible ? 'none' : 'block';

  // Shift chat_container if friend list is visible
  chatContainer.style.right = isFriendListVisible ? '10px' : '250px';
  chatBar.style.right = isFriendListVisible ? '10px' : '250px';
  chatIcon.style.right = isFriendListVisible ? '330px' : '600px';
  if (!isFriendListVisible) {
    fetchAndDisplayFriends(); // Clear friend list
  }
}

// Handle data from get_user_info function
// Fetch and display friends
function fetchAndDisplayFriends() {
  sendPostUserRequest('list_friends')
    .then(data => {
      // Get friend list
      const friends = data.friends;
      // Display friend list
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
    // Create a new notification span if not exists
    notificationSpan = document.createElement('span');
    notificationSpan.classList.add('notification-count');
    userLink.appendChild(notificationSpan);
  }
  
  if (count > 0) {
    notificationSpan.textContent = count; // Update notification count
    notificationSpan.style.display = 'block'; // Show notification span
  } else {
    notificationSpan.style.display = 'none'; // Hide notification span
  }
}

function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = ''; // Clear existing list

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-item');
    friendElement.innerHTML = `
      <p>
        <img src="${friend.profile_picture}" alt="${friend.username}" class="profile-picture">
        <button class="username-btn" data-username="${friend.username}">
          ${friend.username}
        </button>
        <button class="view-profile-btn custom-btn" data-username="${friend.username}">View Profile</button>
        <button class="invite-btn custom-btn" data-username="${friend.username}">Invite</button>
      </p>`;
    friendListContainer.appendChild(friendElement);
  });

  // "View Profile" button click event
  document.querySelectorAll('.view-profile-btn').forEach(button => {
    button.addEventListener('click', function(event) {
      const username = this.getAttribute('data-username');
      viewProfile(username);
    });
  });

  // "Invite" button click event
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

// Profile viewing function
function viewProfile(username) {
  console.log(`Viewing profile of ${username}`);
}

// User invite function
function inviteUser(username) {
  console.log(`Inviting ${username} to play`);
}

export { updateNotificationButton, showTab2WithUsername, selectTab };
