/* 
 .----------------.  .----------------.  .----------------.  .-----------------. .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |     _____    | || |  ________    | || |  _________   | || | ____  _____  | || |  _________   | || |     _____    | || |  _________   | || |  ____  ____  | |
| |    |_   _|   | || | |_   ___ `.  | || | |_   ___  |  | || ||_   \|_   _| | || | |  _   _  |  | || |    |_   _|   | || | |  _   _  |  | || | |_  _||_  _| | |
| |      | |     | || |   | |   `. \ | || |   | |_  \_|  | || |  |   \ | |   | || | |_/ | | \_|  | || |      | |     | || | |_/ | | \_|  | || |   \ \  / /   | |
| |      | |     | || |   | |    | | | || |   |  _|  _   | || |  | |\ \| |   | || |     | |      | || |      | |     | || |     | |      | || |    \ \/ /    | |
| |     _| |_    | || |  _| |___.' / | || |  _| |___/ |  | || | _| |_\   |_  | || |    _| |_     | || |     _| |_    | || |    _| |_     | || |    _|  |_    | |
| |    |_____|   | || | |________.'  | || | |_________|  | || ||_____|\____| | || |   |_____|    | || |    |_____|   | || |   |_____|    | || |   |______|   | |
| |              | || |              | || |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */

 function logoutListener() {
  document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('auth/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getCookie('accessToken')
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(() => {
      // Gerekli temizlik işlemlerini yapın
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      deleteCookie('username');
      closeSocket();

      // Kullanıcıyı giriş sayfasına yönlendir
      changeContent('sign-in');
    })
    .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
    });
  });
}

// document.addEventListener('logout-loaded', function() {
//   // Logout içeriği için özel işlemler burada yapılır
//   logoutListener();
// });


// 'sign-in' içeriği yüklendiğinde çalışacak olay dinleyicisi
function signInListener() {

    // Giriş formu işlevselliğini burada etkinleştir
    document.getElementById('login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const username_or_email = document.getElementById('InputUserOrEmail').value;
      const password = document.getElementById('InputPassword').value;

      fetch('auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username_or_email, password })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.access) {
          // Access ve refresh token'ları cookie'ye kaydedin
          console.log(data.access);
          console.log(data.refresh);
          console.log(data.username);
          // Cookie'leri güvenli bir şekilde ayarlayın
          setCookie('accessToken', data.access, {secure: true});
          setCookie('refreshToken', data.refresh, {secure: true});
          setCookie('username', data.username, {secure: true});
          openSocket();

          // Login başarılı, ana sayfaya yönlendir
          // window.location.href = '/user_profile'; // Örnek bir yönlendirme
          changeContent('home');
        } else {
          // Hata mesajını göster
          alert('Giriş başarısız: ' + data.error);
        }
      })
      .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      });
    });
  }



  function registerListener() {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.querySelector('[name="username"]').value;
        const first_name = document.querySelector('[name="first_name"]').value;
        const last_name = document.querySelector('[name="last_name"]').value;
        const email = document.querySelector('[name="email"]').value;
        const password = document.querySelector('[name="password"]').value;
        const password_repeat = document.querySelector('[name="password_repeat"]').value;

        // Şifrelerin eşleşip eşleşmediğini kontrol et
        if(password !== password_repeat) {
            alert('Passwords do not match.');
            return;
        }

        fetch('auth/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, first_name, last_name, email, password })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(data.success) {
                // Kayıt başarılı, ana sayfaya yönlendir
                changeContent('home');
                console.log('Registration successful:', data.success);
            } else {
                // Hata mesajını göster
                alert('Kayıt başarısız: ' + data.error);
            }
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
    });
}


 /*
  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |   ______     | || |  _______     | || |     ____     | || |  _________   | || |     _____    | || |   _____      | || |  _________   | |
| |  |_   __ \   | || | |_   __ \    | || |   .'    `.   | || | |_   ___  |  | || |    |_   _|   | || |  |_   _|     | || | |_   ___  |  | |
| |    | |__) |  | || |   | |__) |   | || |  /  .--.  \  | || |   | |_  \_|  | || |      | |     | || |    | |       | || |   | |_  \_|  | |
| |    |  ___/   | || |   |  __ /    | || |  | |    | |  | || |   |  _|      | || |      | |     | || |    | |   _   | || |   |  _|  _   | |
| |   _| |_      | || |  _| |  \ \_  | || |  \  `--'  /  | || |  _| |_       | || |     _| |_    | || |   _| |__/ |  | || |  _| |___/ |  | |
| |  |_____|     | || | |____| |___| | || |   `.____.'   | || | |_____|      | || |    |_____|   | || |  |________|  | || | |_________|  | |
| |              | || |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */


 function pendingFriendRequests() {
  sendPostUserRequest('list_pending_friend_requests')
  .then(data => {
    if (!data.pending_requests || data.pending_requests.length === 0 || data.pending_requests === 'nonerequests') {
      console.log('Bekleyen arkadaşlık isteği yok');
      return; // Eğer bekleyen istek yoksa, burada işlemi durdur.
    }
    const list = document.getElementById('pendingFriendRequests');
    // Mevcut listeyi temizle
    list.innerHTML = '';
    // Yeni istekler için 'li' elementleri ve butonlar oluştur
    data.pending_requests.forEach(request => {
      const listItem = document.createElement('li');
      listItem.className = 'list-group-item d-flex justify-content-between align-items-center';

      // Kullanıcı adını gösteren span elementi
      const usernameSpan = document.createElement('span');
      usernameSpan.textContent = request.from_user;

      // Kabul Et butonu
      const acceptBtn = document.createElement('button');
      acceptBtn.className = 'btn btn-success btn-sm';
      acceptBtn.textContent = 'Kabul Et';
      acceptBtn.onclick = function() { acceptFriendRequest(request.from_user); };

      // Reddet butonu
      const rejectBtn = document.createElement('button');
      rejectBtn.className = 'btn btn-danger btn-sm';
      rejectBtn.textContent = 'Reddet';
      rejectBtn.onclick = function() { rejectFriendRequest(request.from_user); };

      // 'li' elementine kullanıcı adı ve butonları ekle
      listItem.appendChild(usernameSpan);
      listItem.appendChild(acceptBtn);
      listItem.appendChild(rejectBtn);

      // Listeye 'li' elementini ekle
      list.appendChild(listItem);
    });
  })
  .catch(error => console.error('Bekleyen arkadaşlık istekleri alınırken hata oluştu:', error));
}

// Arkadaşlık isteğini kabul etme
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

// Arkadaşlık isteğini reddetme
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

// function updateFriendList(friendsData) {
//   const tbody = document.querySelector('#friend-list tbody');
//   tbody.innerHTML = ''; // Mevcut listeyi temizle

//   friendsData.forEach(friend => {
//     const tr = document.createElement('tr');
//     tr.innerHTML = `
//       <td><img class="rounded-circle me-2" width="30" height="30" src="{% static "${friend.profile_picture}" %}" />${friend.username}</td>
//       <td><button class="btn ${friend.online ? 'btn-success' : 'btn-secondary'}" type="button">${friend.online ? 'online' : 'offline'}</button></td>
//       <td><button class="btn btn-warning" type="button">message</button></td>
//       <td><button class="btn btn-info" type="button">invite</button></td>
//       <td><button class="btn ${friend.muted ? 'btn-danger' : 'btn-success'}" type="button">${friend.muted ? 'unmute' : 'mute'}</button></td>
//       <td>
//         <div class="btn-group">
//           <button class="btn btn-primary" type="button">other</button>
//           <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false" type="button"></button>
//           <div class="dropdown-menu">
//             <a class="dropdown-item" href="#">First Item</a>
//             <a class="dropdown-item" href="#">Second Item</a>
//             <a class="dropdown-item" href="#">Third Item</a>
//           </div>
//         </div>
//       </td>
//     `;
//     tbody.appendChild(tr);
//   });
// }

function updateFriendList(friendsData) {
  const tbody = document.querySelector('#dataTable tbody');
  tbody.innerHTML = ''; // Mevcut listeyi temizle

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
            <a class="dropdown-item" href="#">First Item</a>
            <a class="dropdown-item" href="#">Second Item</a>
            <a class="dropdown-item" href="#">Third Item</a>
          </div>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}


// Arkadaş listesini görüntüleme
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


function profileListener() {
 
  
  const dynamicLinks = document.querySelectorAll('.dynamic-profile');

  // Her bir link için olay dinleyici ekle
  dynamicLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const contentId = this.id.replace('-link', ''); // 'sign-in-link' -> 'sign-in'
      changeContentProfile(contentId);
    });
  });

 

  // pendingFriendRequests();
    //listFriends();

  // const buttons = document.querySelectorAll('button:not(#add_friend)');
  // buttons.forEach(button => {
  //     button.addEventListener('click', function(e) {
  //         e.preventDefault();
  //         const action = this.id;
  //         const friendId = this.dataset.friendId;
  //         sendPostUserRequest(action, friendId);
  //     });
  // });
}


 /*
  .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |              | || |              | || | _____  _____ | || |     _____    | || |              | || |              | |
| |              | || |              | || ||_   _||_   _|| || |    |_   _|   | || |              | || |              | |
| |    ______    | || |    ______    | || |  | |    | |  | || |      | |     | || |    ______    | || |    ______    | |
| |   |______|   | || |   |______|   | || |  | '    ' |  | || |      | |     | || |   |______|   | || |   |______|   | |
| |              | || |              | || |   \ `--' /   | || |     _| |_    | || |              | || |              | |
| |              | || |              | || |    `.__.'    | || |    |_____|   | || |              | || |              | |
| |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */
 async function changeContent(contentId) {
  console.log('İçerik değiştiriliyor:', contentId);
  if (localStorage.getItem('contentData') === null) {
    const contentData = JSON.parse(document.getElementById('content-data').textContent);
    localStorage.setItem('contentData', JSON.stringify(contentData));
  }
  else {
    var contentData = JSON.parse(localStorage.getItem('contentData'));
  }
  if ( contentId !== 'logout' && contentData[contentId] === undefined) {
    console.log('Content not found');
    return;
  }
  if (contentId === 'logout') {
    logoutListener();
  }
  else{

    const htmlContent =contentData[contentId];
    document.getElementById('main-content').innerHTML = htmlContent;
    history.pushState({ id: contentId, htmlContent: htmlContent }, null, null);
    triggerContentLoad(contentId);
  }
  checkAuthStatus();

}

function addfriendListener() {
   document.getElementById('add_friend').addEventListener('click', function(e) {
      e.preventDefault();
      const friend_username = document.getElementById('friend_usernameInput').value;
      sendPostUserRequest('add_friend', friend_username);
  });
}

async function changeContentProfile(contentId) {
  console.log('İçerik değiştiriliyor:', contentId);
  if (localStorage.getItem('contentData') === null) {
    const contentData = JSON.parse(document.getElementById('content-data').textContent);
    localStorage.setItem('contentData', JSON.stringify(contentData));
  }
  else {
    var contentData = JSON.parse(localStorage.getItem('contentData'));
  }
  if ( contentId !== 'logout' && contentData[contentId] === undefined) {
    console.log('Content not found');
    return;
  }
  if (contentId === 'logout') {
    logoutListener();
  }
  else{
    
    const htmlContent =contentData[contentId];
    document.getElementById('content-profile').innerHTML = htmlContent;
    history.pushState({ id: contentId, htmlContent: htmlContent }, null, null);
    if (contentId === 'friends') {
      listFriends();
      pendingFriendRequests();
      addfriendListener();

    }
    triggerContentLoad(contentId);
  }
  checkAuthStatus();

}

window.onpopstate = function(event) {
  if (event.state) {
    document.getElementById('main-content').innerHTML = event.state.htmlContent;
  }
};


function checkAuthStatus() {
  const accessToken =getCookie('accessToken');
  const signInLink = document.getElementById('sign-in-link');
  const signUpLink = document.getElementById('sign-up-link');
  const profileLink = document.getElementById('profile-link');
  const logoutLink = document.getElementById('logout-link');
  const chat_boxlink = document.getElementById('chat_box');

  if (accessToken) {
    // Kullanıcı oturum açmışsa, giriş ve kayıt linklerini gizle
    signInLink.style.display = 'none';
    signUpLink.style.display = 'none';
    // Profil ve çıkış butonlarını göster
    profileLink.style.display = 'block';
    logoutLink.style.display = 'block';
    chat_boxlink.style.display = 'block';
  } else {
    // Kullanıcı oturum açmamışsa, profil ve çıkış butonlarını gizle
    profileLink.style.display = 'none';
    logoutLink.style.display = 'none';
    chat_boxlink.style.display = 'none';
    // Giriş ve kayıt linklerini göster
    signInLink.style.display = 'block';
    signUpLink.style.display = 'block';
  }
}


document.getElementById('chat_bar').addEventListener('click', function() {
  var chatContainer = document.getElementById('chat_container');
  var chatBar = document.getElementById('chat_bar');
  var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';

  // Sohbet penceresinin yüksekliğini ve gri çubuğun alt pozisyonunu güncelle
  chatContainer.style.height = isClosed ? '300px' : '0px';
  chatBar.style.bottom = isClosed ? '310px' : '10px'; // Gri çubuğun alt pozisyonunu ayarla
});


 /* 
 .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. |
| |   ______     | || |     ____     | || |    _______   | || |  _________   | |
| |  |_   __ \   | || |   .'    `.   | || |   /  ___  |  | || | |  _   _  |  | |
| |    | |__) |  | || |  /  .--.  \  | || |  |  (__ \_|  | || | |_/ | | \_|  | |
| |    |  ___/   | || |  | |    | |  | || |   '.___`-.   | || |     | |      | |
| |   _| |_      | || |  \  `--'  /  | || |  |`\____) |  | || |    _| |_     | |
| |  |_____|     | || |   `.____.'   | || |  |_______.'  | || |   |_____|    | |
| |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------' 
 */

 function sendGetRequestWithJwt(url) {
  // Oturum doğrulama durumunu kontrol et
  checkAuthStatus();

  // JWT'yi cookie'den al
  const accessToken = getCookie('accessToken');

  // Eğer bir access token varsa, Authorization header'ına ekle
  const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

  // Fetch API ile isteği gönder
  return fetch(url, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  })
  .then(response => {
    // Yanıtın başarılı olup olmadığını kontrol et
    if (!response.ok) {
      throw new Error(`Request failed with status: ${response.status}`);
    }
    return response.json(); // Yanıtı JSON olarak dönüştür
  })
  .then(data => {
    // Profil bilgilerini konsola yazdır
    console.log('Profil bilgileri:', data);
    // displayProfile(data); // Profil bilgilerini göstermek için bir fonksiyon çağırabilirsiniz
  })
  .catch(error => {
    // Hata mesajını konsola yazdır
    console.error('Hata:', error);
    // showError(error); // Hata mesajını kullanıcıya göstermek için bir fonksiyon çağırabilirsiniz
  });
}

 function sendPostUserRequest(action, friend_username = null) {
  return new Promise((resolve, reject) => {
    const accessToken = getCookie('accessToken');
    const headers = new Headers({
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    });

    const bodyData = { 'action': action };
    if (friend_username) {
        bodyData['friend_username'] = friend_username;
    }
    const body = JSON.stringify(bodyData);
    fetch('user/user_actions/', {
        method: 'POST',
        headers: headers,
        body: body
    })
    .then(response => response.json())
    .then(data => resolve(data))
    .catch(error => reject(error));
  });
}

 /*
 .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |     ______   | || |     ____     | || |     ____     | || |  ___  ____   | || |     _____    | || |  _________   | |
| |   .' ___  |  | || |   .'    `.   | || |   .'    `.   | || | |_  ||_  _|  | || |    |_   _|   | || | |_   ___  |  | |
| |  / .'   \_|  | || |  /  .--.  \  | || |  /  .--.  \  | || |   | |_/ /    | || |      | |     | || |   | |_  \_|  | |
| |  | |         | || |  | |    | |  | || |  | |    | |  | || |   |  __'.    | || |      | |     | || |   |  _|  _   | |
| |  \ `.___.'\  | || |  \  `--'  /  | || |  \  `--'  /  | || |  _| |  \ \_  | || |     _| |_    | || |  _| |___/ |  | |
| |   `._____.'  | || |   `.____.'   | || |   `.____.'   | || | |____||____| | || |    |_____|   | || | |_________|  | |
| |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */

 function setCookie(name, value, options = {}) {
  options = {
    path: '/',
    // Varsayılan olarak güvenli olmalı
    ...options,
    // Eğer belirtilmemişse, güvenli ve samesite varsayılanları ekleyin
    secure: true,
    samesite: 'strict',
    ...(!options.expires && { expires: 365 })
  };

  if (options.expires instanceof Date) {
    options.expires = options.expires.toUTCString();
  }

  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }

  document.cookie = updatedCookie;
}

// Cookie silme fonksiyonu
function deleteCookie(name) {
  setCookie(name, "", {
    'max-age': -1
  });
}


// Cookie alma fonksiyonu
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

 /*
 .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |    _______   | || |     ____     | || |     ______   | || |  ___  ____   | || |  _________   | || |  _________   | |
| |   /  ___  |  | || |   .'    `.   | || |   .' ___  |  | || | |_  ||_  _|  | || | |_   ___  |  | || | |  _   _  |  | |
| |  |  (__ \_|  | || |  /  .--.  \  | || |  / .'   \_|  | || |   | |_/ /    | || |   | |_  \_|  | || | |_/ | | \_|  | |
| |   '.___`-.   | || |  | |    | |  | || |  | |         | || |   |  __'.    | || |   |  _|  _   | || |     | |      | |
| |  |`\____) |  | || |  \  `--'  /  | || |  \ `.___.'\  | || |  _| |  \ \_  | || |  _| |___/ |  | || |    _| |_     | |
| |  |_______.'  | || |   `.____.'   | || |   `._____.'  | || | |____||____| | || | |_________|  | || |   |_____|    | |
| |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */

 let chatSocket;

 function openSocket() {
   // WebSocket bağlantısını açan fonksiyon
   chatSocket = new WebSocket('ws://' + window.location.host + '/?token=' + getCookie('accessToken'));
 
   chatSocket.onmessage = function(e) {
     var data = JSON.parse(e.data);
     var chatMessages = document.getElementById('chat_messages');
     var messageDiv = document.createElement('div');
     messageDiv.textContent = data.username + ': ' + data.message;
     chatMessages.appendChild(messageDiv);
     chatMessages.scrollTop = chatMessages.scrollHeight;
   };
 
   chatSocket.onclose = function(e) {
     console.error('Chat socket closed unexpectedly');
   };
 }
 
 function closeSocket() {
   // WebSocket bağlantısını kapatan fonksiyon
   if (chatSocket) {
     chatSocket.close();
   }
 }
 
 document.getElementById('chat_send').onclick = function() {
   var messageInput = document.getElementById('chat_input');
   var message = messageInput.value;
   const username = getCookie('username');
 
   if (chatSocket) {
     chatSocket.send(JSON.stringify({ 'message': message, 'username': username }));
   }
   messageInput.value = '';
 };
 
 document.getElementById('chat_input').onkeypress = function(e) {
   if (e.keyCode === 13) {  // Enter tuşu
     document.getElementById('chat_send').click();
   }
 };
 
 

 /* 
 .----------------.  .----------------.  .----------------.  .----------------.  .----------------.  .-----------------. .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |   _____      | || |     ____     | || |      __      | || |  ________    | || |     _____    | || | ____  _____  | || |    ______    | |
| |  |_   _|     | || |   .'    `.   | || |     /  \     | || | |_   ___ `.  | || |    |_   _|   | || ||_   \|_   _| | || |  .' ___  |   | |
| |    | |       | || |  /  .--.  \  | || |    / /\ \    | || |   | |   `. \ | || |      | |     | || |  |   \ | |   | || | / .'   \_|   | |
| |    | |   _   | || |  | |    | |  | || |   / ____ \   | || |   | |    | | | || |      | |     | || |  | |\ \| |   | || | | |    ____  | |
| |   _| |__/ |  | || |  \  `--'  /  | || | _/ /    \ \_ | || |  _| |___.' / | || |     _| |_    | || | _| |_\   |_  | || | \ `.___]  _| | |
| |  |________|  | || |   `.____.'   | || ||____|  |____|| || | |________.'  | || |    |_____|   | || ||_____|\____| | || |  `._____.'   | |
| |              | || |              | || |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------'  '----------------' 
 */


 document.addEventListener('profile-loaded', function() {
  // Sign-in içeriği için özel işlemler burada yapılır

  profileListener();
  // getFriends();
});

  document.addEventListener('sign-in-loaded', function() {
    // Sign-in içeriği için özel işlemler burada yapılır
    signInListener();
  });



document.addEventListener('sign-up-loaded', function() {
  // Sign-in içeriği için özel işlemler burada yapılır
  registerListener();
});


//-------
function hrefListener() {

  const dynamicLinks = document.querySelectorAll('.dynamic-content');

  // Her bir link için olay dinleyici ekle
  dynamicLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const contentId = this.id.replace('-link', ''); // 'sign-in-link' -> 'sign-in'
      changeContent(contentId);
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {

  const contentData = JSON.parse(document.getElementById('content-data').textContent);
  localStorage.setItem('contentData', JSON.stringify(contentData));
  checkAuthStatus();
  hrefListener();
 
});
  



// document.addEventListener('DOMContentLoaded', function() {
//   // 'dynamic-content' sınıfına sahip tüm linkleri seç
//   const contentData = JSON.parse(document.getElementById('content-data').textContent);
//   localStorage.setItem('contentData', JSON.stringify(contentData));
//   checkAuthStatus();
//   const dynamicLinks = document.querySelectorAll('.dynamic-content');

//   // Her bir link için olay dinleyici ekle
//   dynamicLinks.forEach(link => {
//     link.addEventListener('click', function(event) {
//       event.preventDefault();
//       const contentId = this.id.replace('-link', ''); // 'sign-in-link' -> 'sign-in'
//       changeContent(contentId);
//     });
//   });
// });

// document.addEventListener('DOMContentLoaded', function() {
//   // 'dynamic-content' sınıfına sahip tüm linkleri seç
//   const dynamicLinks = document.querySelectorAll('.dynamic-content');

//   // Her bir link için olay dinleyici ekle
//   dynamicLinks.forEach(link => {
//     link.addEventListener('click', function(event) {
//       event.preventDefault();

//       // Tıklanan linkin metnini al
//       const contentId = this.textContent.trim(); // Boşlukları temizle

//       // İçeriği değiştirme fonksiyonunu çağır
//       changeContent(contentId);
//     });
//   });

//   // Diğer kodunuz... (contentData, localStorage, checkAuthStatus)
// });

// İçeriğin Yüklendiğini Belirten Özel Bir Olayı Tetikleyen Fonksiyon
function triggerContentLoad(contentId) {
  const event = new Event(contentId + '-loaded');
  document.dispatchEvent(event);
  //hrefListener();
  // Diğer özel olaylar burada tetiklenebilir
}

  // Sayfa yüklendiğinde oturum durumunu kontrol et
 // checkAuthStatus();

  // Oturum açma ve kapatma işlemlerinden sonra oturum durumunu güncelle
  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
      checkAuthStatus();
    }
  });




// Arkadaş listesini getirme ve düğmeleri oluşturma
// function getFriends() {
//   sendPostRequest('get_friends');
//   // Arkadaş listesi alındığında aşağıdaki gibi düğmeleri oluşturun
//   // Örnek arkadaş listesi verisi
//   const friends = [
//       { id: 1, username: 'friend1' },
//       { id: 2, username: 'friend2' }
//       // ...
//   ];
//   const friendsListDiv = document.getElementById('friendsList');
//   friends.forEach(friend => {
//       const div = document.createElement('div');
//       div.className = 'friend-actions';
//       div.innerHTML = `
//           <span class="friend-name">${friend.username}</span>
//           <button id="ban_user" data-friend-id="${friend.id}">Block</button>
//           <button id="mute_user" data-friend-id="${friend.id}">Mute</button>
//           <button id="remove_friend" data-friend-id="${friend.id}">Remove</button>
//       `;
//       friendsListDiv.appendChild(div);
//   });
//   profileListener(); // Düğmelere olay dinleyicileri ekleyin
// }



// -------



// Cookie ayarlama fonksiyonu


// JWT ile güvenli bir GET isteği gönderme fonksiyonu


// Profil linkine tıklama olayını dinle
// const profileLink = document.getElementById('profile-link');
// profileLink.addEventListener('click', (event) => {
//   event.preventDefault();
//   sendGetRequestWithJwt('guest/profile/')
//     .then(data => {
//       // Profil bilgilerini göstermek için bir fonksiyon çağırabilirsiniz
//       // displayProfile(data);
//     })
//     .catch(error => {
//       // Hata mesajını kullanıcıya göstermek için bir fonksiyon çağırabilirsiniz
//       // showError(error);
//     });
// });



  



// JavaScript ile Dinamik İçerik Değiştirme


  // sendGetRequestWithJwt('127.0.0.1/get_username/')
  // .then(response => {
  //   if (!response.ok) {
  //     throw new Error('Profil bilgileri alınamadı');
  //   }
  //   return response.json();
  // })
  // .then(data => {
  //    username = data.username;
  // })
  // .catch(error => {
  //   console.error(error);
  //   // Hata mesajını kullanıcıya göstermek için bir fonksiyon çağırabilirsiniz
  //   // showError(error);
  // });

//---websockets---
// const chatSocket = new WebSocket('ws://' + window.location.host + '/');

// // Mesaj gönderme işlevi
// document.getElementById('chat_send').onclick = function() {
//   const messageInput = document.getElementById('chat_input');
//   const message = messageInput.value;
//   // 'username' anahtarını mesaj objesine ekleyin.
//   // const username = localStorage.getItem('username');
//   const username = getCookie('username') // veya localStorage

//   chatSocket.send(JSON.stringify({ 'message': message, 'username': username }));
//   messageInput.value = '';
// };


// // Enter tuşu ile mesaj gönderme
// document.getElementById('chat_input').onkeypress = function(e) {
//     if (e.keyCode === 13) {  // Enter tuşu
//         document.getElementById('chat_send').click();
//     }
// };

// // Gelen mesajları işleme
// chatSocket.onmessage = function(e) {
// const data = JSON.parse(e.data);
// const chatMessages = document.getElementById('chat_messages');
// const messageDiv = document.createElement('div');
// // Kullanıcı adını ve mesajı formatlayın.
// messageDiv.textContent = data.username + ': ' + data.message;
// chatMessages.appendChild(messageDiv);
// chatMessages.scrollTop = chatMessages.scrollHeight;  // Otomatik kaydırma
// };

// chatSocket.onclose = function(e) {
//     console.error('Chat socket closed unexpectedly');
// };

// Chatbox'ı açıp kapatma fonksiyonu
// document.getElementById('chat_toggle').onclick = function() {
//   var chatContainer = document.getElementById('chat_container');
//   var isClosed = chatContainer.style.height === '0px';
//   chatContainer.style.height = isClosed ? '400px' : '0px';
//   chatContainer.style.overflow = isClosed ? 'auto' : 'hidden';
// };



  // JavaScript
 
  

