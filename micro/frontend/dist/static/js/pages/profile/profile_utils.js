import  sendPostUserRequest from '../../postwithjwt/userRequest.js';
import  sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';
import { selectTab } from '../../uimodule/chatBox.js';

function addfriendListener() {
    document.getElementById('add_friend').addEventListener('click', function(e) {
       e.preventDefault();
       const friend_username = document.getElementById('friend_usernameInput').value;
       sendPostUserRequest('add_friend', friend_username)
       .then(data => {
         listFriends();
       })
       .catch(error => {
         console.error('İşlem hatası:', error);
       });
   });
 
   const tbody = document.querySelector('#dataTable tbody');
   tbody.addEventListener('click', function(e) {
     const friendUsername = e.target.closest('tr').querySelector('td:first-child').textContent.trim();
     const action = e.target.textContent;
     if (action === 'mute' || action === 'unmute'
       || action === 'message' || action === 'invite' || action === 'show profile' || action === 'remove friend' || action === 'block'){
       
         if (action === 'message') {
           if (window.otherUser !== this.getAttribute('data-username')) {
            window.otherUser = this.getAttribute('data-username');
           }
           selectTab('tab2');
           return;
         }
       
       sendPostUserRequest(action, friendUsername)
       .then(data => {
       if (action === 'mute' || action === 'unmute') {
       listFriends();
       }
       })
       .catch(error => {
       console.error('İşlem hatası:', error);
       });
     }
   }); 
 }
 

function updateFriendList(friendsData) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';
    friendsData.forEach(friend => {
      const tr = document.createElement('tr');
      const profilePictureUrl = friend.profile_picture || 'default-profile-picture-url'; // Varsayılan resim URL'si
      tr.innerHTML = `
        <td><img class="rounded-circle me-2" width="30" height="30" src="${profilePictureUrl}" alt="Profile Picture"/>${friend.username}</td>
        <td><button class="btn ${friend.online ? 'btn-success' : 'btn-secondary'}" type="button">${friend.online ? 'online' : 'offline'}</button></td>
        <td><button class="btn btn-warning" type="button">message</button></td>
        <td><button class="btn btn-info" type="button">invite</button></td>
        <td><button class="btn ${friend.muted ? 'btn-danger' : 'btn-success'}" type="button">${friend.muted ? 'unmute' : 'mute'}</button></td>
        <td>
          <div class="btn-group">
            <button class="btn btn-primary" type="button">other</button>
            <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false" type="button"></button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#">show profile</a>
              <a class="dropdown-item" href="#">remove friend</a>
              <a class="dropdown-item" href="#">block</a>
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
          console.error('Hata:', data.error);
        }
      })
      .catch(error => console.error('İstek sırasında hata oluştu:', error));
  }
  
  function acceptFriendRequest(friendUsername) {
    sendPostUserRequest('accept_friend_request', friendUsername)
      .then(data => {
        if (data.success) {
          console.log('Arkadaşlık isteği kabul edildi:', data);
        } else {
          console.error('Hata:', data.error);
        }
      })
      .catch(error => console.error('İstek sırasında hata oluştu:', error));
  }
  
  function rejectFriendRequest(friendUsername) {
    sendPostUserRequest('reject_friend_request', friendUsername)
      .then(data => {
        if (data.success) {
          console.log('Arkadaşlık isteği reddedildi:', data);
        } else {
          console.error('Hata:', data.error);
        }
      })
      .catch(error => console.error('İstek sırasında hata oluştu:', error));
  }

  
  function pendingFriendRequests() {
    sendPostUserRequest('list_pending_friend_requests')
    .then(data => {
      if (!data.pending_requests || data.pending_requests.length === 0 || data.pending_requests === 'nonerequests') {
        console.log('Bekleyen arkadaşlık isteği yok');
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
        acceptBtn.textContent = 'Kabul Et';
        acceptBtn.onclick = function() { acceptFriendRequest(request.from_user); };
  
        const rejectBtn = document.createElement('button');
        rejectBtn.className = 'btn btn-danger btn-sm';
        rejectBtn.textContent = 'Reddet';
        rejectBtn.onclick = function() { rejectFriendRequest(request.from_user); };
  
        listItem.appendChild(usernameSpan);
        listItem.appendChild(acceptBtn);
        listItem.appendChild(rejectBtn);
        list.appendChild(listItem);
      });
    })
    .catch(error => console.error('Bekleyen arkadaşlık istekleri alınırken hata oluştu:', error));
  }
  

  function accountListener() {
  
    document.querySelector('.finput').addEventListener('click', async function() {
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; 
      fileInput.onchange = async e => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('profile_pic', file);
        try {
          const data = await sendPostWithJwt('api/user/update_profile_pic/', formData);
          console.log('success:', data);
        } catch (error) {
          console.error('error:', error);
        }
      };
    
     
      fileInput.click(); 
    });
    
   
    
  
    
    sendPostWithJwt('api/user/get_info/', {}, 'GET')
    .then(userData => {
      // API'den gelen kullanıcı verilerini form alanlarına yerleştir
      document.getElementById('username').value = userData.username;
      document.getElementById('email').value = userData.email;
      document.getElementById('first_name').value = userData.first_name;
      document.getElementById('last_name').value = userData.last_name;
      // Profil fotoğrafını güncelle
      document.querySelector('.card-body img').src = userData.profile_picture;
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
  
    // Form gönderme olayını dinle
    document.querySelector('form').addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = {
        email: document.getElementById('email').value,
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value
      };
      sendPostWithJwt('api/user/update_user/', formData)
      .then(data => {
        console.log('success:', data);
      })
      .catch((error) => {
        console.error('error:', error);
      });
    });
  }


  export { addfriendListener,  listFriends, pendingFriendRequests, accountListener };