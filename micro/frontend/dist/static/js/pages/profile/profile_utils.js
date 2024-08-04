import  sendPostUserRequest from '../../postwithjwt/userRequest.js';
import { selectTab } from '../../uimodule/chatBox.js';
import { getCookie } from '../../cookies/cookies.js';
import  openSocketPrivate  from '../../sockets/privateSocket.js';
import changeContent from '../../uimodule/changeContent.js';
function addfriendListener() {
    document.getElementById('add_friend').addEventListener('click', function(e) {
       e.preventDefault();
       const friend_username = document.getElementById('friend_usernameInput').value;
       sendPostUserRequest('add_friend', friend_username)
       .then(data => {
         listFriends();
       })
       .catch(error => {
         console.error('Processing error:', error);
       });
   });
 
   const tbody = document.querySelector('#dataTable tbody');
   tbody.addEventListener('click', function(e) {
     const friendUsername = e.target.closest('tr').querySelector('td:first-child').textContent.trim();
     let action = e.target.textContent;
     if (action === 'remove block') {
       action = 'remove_block';
     }
     if (action === 'block' || action === 'remove_block'
       || action === 'message'  || action === 'show profile' || action === 'remove friend'){
       
         if (action === 'message') {
           if (window.otherUser !== friendUsername) {
               window.otherUser = friendUsername;
             }
           selectTab('tab2');     
           var chatContainer = document.getElementById('chat_container');
           var chatBar = document.getElementById('chat_bar');
           chatContainer.style.height = '285px';
           chatBar.style.bottom = '310px';
           return;
         }
       
       sendPostUserRequest(action, friendUsername)
       .then(data => {
       if (action === 'block' || action === 'remove_block') {
       listFriends();
       }
       })
       .catch(error => {
       console.error('Processing error:', error);
       });
     }
   }); 
 }
 

 function updateFriendList(friendsData) {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';


  // Retrieve and parse online players from the cookie
  const onlinePlayers = getCookie('onlinePlayers') || [];
  
  friendsData.forEach(friend => {
      // Determine if the friend is online
      const isOnline = onlinePlayers.includes(friend.username);
      const tr = document.createElement('tr');
      const profilePictureUrl = friend.profile_picture || 'default-profile-picture-url'; // Default profile picture URL
      
      tr.innerHTML = `
          <td><img class="rounded-circle me-2" width="30" height="30" src="${profilePictureUrl}" alt="Profile Picture"/>${friend.username}</td>
          <td><button class="btn ${isOnline ? 'btn-success' : 'btn-secondary'}" type="button">${isOnline ? 'online' : 'offline'}</button></td>
          <td><button class="btn btn-warning" type="button">message</button></td>
          <td><button class="btn ${friend.block ? 'btn-danger' : 'btn-success'}" type="button">${friend.block ? 'remove block' : 'block'}</button></td>
          <td>
              <div class="btn-group">
                  <button class="btn btn-primary" type="button">other</button>
                  <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false" type="button"></button>
                  <div class="dropdown-menu">
                      <a class="dropdown-item" href="#">remove friend</a>
                  </div>
              </div>
          </td>
      `;
      tbody.appendChild(tr);
  });
}
function listFriends() {
    sendPostUserRequest('list_friends')
      .then(data => {
        if (data.friends) {
          console.log('Arkadaş listesi:', data.friends);
          updateFriendList(data.friends);
        } else {
          console.error('Error:', data.error);
        }
      })
      .catch(error => console.error('An error occurred during the request:', error));
  }
  
  function acceptFriendRequest(friendUsername) {
    sendPostUserRequest('accept_friend_request', friendUsername)
      .then(data => {
        if (data.success) {
          console.log('Friend request accepted:', data);
          listFriends(); // Refresh the friend list to sync the view
        } else {
          console.error('Error', data.error);
        }
      })
      .catch(error => console.error('An error occurred during the request:', error));
  }
  
  function rejectFriendRequest(friendUsername) {
    sendPostUserRequest('reject_friend_request', friendUsername)
      .then(data => {
        if (data.success) {
          console.log('Friend request rejected:', data);
          listFriends();
        } else {
          console.error('Error:', data.error);
        }
      })
      .catch(error => console.error('An error occurred during the request:', error));
  }

  
  function pendingFriendRequests() {
    sendPostUserRequest('list_pending_friend_requests')
    .then(data => {
      if (!data.pending_requests || data.pending_requests.length === 0 || data.pending_requests === 'nonerequests') {
        console.log('There are no pending friend requests');
        return; 
      }
      const list = document.getElementById('pendingFriendRequests');
      list.innerHTML = '';
      data.pending_requests.forEach(request => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
  
        const usernameSpan = document.createElement('span');
        usernameSpan.textContent = request.from_user;
  
        const acceptBtn = document.createElement('button');
        acceptBtn.className = 'btn btn-success btn-sm';
        acceptBtn.textContent = 'Accept';
        acceptBtn.onclick = function() { acceptFriendRequest(request.from_user);
         if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
          const message = {
            command: 'update'
          };
          window.chatSocketPrivate.send(JSON.stringify(message));
         }
         else{
            openSocketPrivate();
         }
         
         changeContent('friends');
         };
  
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn btn-danger btn-sm';
        rejectBtn.textContent = 'Decline';
        rejectBtn.onclick = function() { rejectFriendRequest(request.from_user); };
  
        listItem.appendChild(usernameSpan);
        listItem.appendChild(acceptBtn);
        listItem.appendChild(rejectBtn);
        list.appendChild(listItem);
      });
    })
    .catch(error => console.error('An error occurred while receiving pending friend requests:', error));
  }
  



  export { addfriendListener,  listFriends, pendingFriendRequests };