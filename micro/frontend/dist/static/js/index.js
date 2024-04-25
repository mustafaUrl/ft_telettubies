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
// Refresh token'ı belirli aralıklarla yenilemek için setInterval kullanın
setInterval(refreshAccessToken, 4 * 60 * 1000); // Her 4 dakikada bir yenile


 function logoutListener() {
  document.getElementById('logout-link').addEventListener('click', function(e) {
    e.preventDefault();
    fetch('api/auth/logout/', {
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
      deleteCookie('accessToken');
      deleteCookie('refreshToken');
      deleteCookie('username');
      closeSocket();

      // Kullanıcıyı giriş sayfasına yönlendir
      changeContent('sign-in');
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

    fetch('api/auth/login/', {
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
        selectTab('tab1');
        openSocket();
        openSocketPrivate();
        
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

        fetch('api/auth/register/', {
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



 function accountListener() {
  // Erişim belirtecini çerezlerden al
  // const accessToken = getCookie('accessToken');

  document.querySelector('.finput').addEventListener('click', async function() {
    // Erişim belirtecinizi buraya ekleyin
  
    // Dosya seçim inputunu oluştur
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Sadece resim dosyalarını kabul et
    fileInput.onchange = async e => {
      // Kullanıcının seçtiği dosyayı al
      const file = e.target.files[0];
      // FormData nesnesini oluştur ve dosyayı ekle
      const formData = new FormData();
      formData.append('profile_pic', file);
  
      // Sunucuya POST isteği yaparak dosyayı gönder
      //sui
      // fetch('api/user/update_profile_pic/', { // Sunucu tarafı yükleme endpoint'i
      //   method: 'POST',
      //   headers: {
      //     // 'Content-Type': 'application/json', bu satırı kaldırın çünkü multipart/form-data kullanıyoruz
      //     'Authorization': `Bearer ${accessToken}`
      //   },
      //   body: formData
      // })
      try {
        const data = await sendPostWithJwt('api/user/update_profile_pic/', formData);
        console.log('success:', data);
      } catch (error) {
        console.error('error:', error);
      }
    };
  
    // Dosya seçim penceresini aç
    fileInput.click(); // Bu satır, programatik olarak dosya seçim penceresini açar
  });
  
  
  // Profil fotoğrafını güncellemek için düğmeye tıklama olayını dinle
  

  // Kullanıcı bilgilerini almak için API'ye istek yap
  // fetch('api/user/get_info', {//sui
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${accessToken}`
  //   }
  // })
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

    // Kullanıcı bilgilerini güncellemek için API'ye istek yap
    // fetch('api/user/update_user/', {//sui
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${accessToken}`
    //   },
    //   body: JSON.stringify(formData)
    // })
    sendPostWithJwt('api/user/update_user/', formData)
    .then(data => {
      console.log('success:', data);
    })
    .catch((error) => {
      console.error('error:', error);
    });
  });
}

// Sayfa yüklendiğinde accountListener fonksiyonunu çalıştır


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
  let contentData = JSON.parse(localStorage.getItem('contentData'));
  
  if (contentData === null) {
    try {
      const response = await fetch('/api/content/');
      contentData = await response.json();
      localStorage.setItem('contentData', JSON.stringify(contentData));
    } catch (error) {
      console.error('Error:', error);
      return; // Hata durumunda fonksiyondan çık
    }
  }
  
  
  if (contentId !== 'logout' && contentData[contentId] === undefined) {
    console.log('Content not found');
    return;
  }
  
  if (contentId === 'logout') {
    logoutListener();
  } else {
    const htmlContent = contentData[contentId];
    if (htmlContent) {
      document.getElementById('main-content').innerHTML = htmlContent;
      history.pushState({ id: contentId, htmlContent: htmlContent, profileContent: false }, null, null);
      triggerContentLoad(contentId);
    } else {
      console.log('İçerik bulunamadı:', contentId);
    }
  }
  console.log("lol");
  checkAuthStatus();
  console.log("lol2");
  
}


function addfriendListener() {
   document.getElementById('add_friend').addEventListener('click', function(e) {
      e.preventDefault();
      const friend_username = document.getElementById('friend_usernameInput').value;
      sendPostUserRequest('add_friend', friend_username)
      .then(data => {
        console.log('İşlem başarılı:', data);
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
    console.log('Tıklanan arkadaş:', friendUsername, 'İşlem:', action);
    if (action === 'mute' || action === 'unmute'
      || action === 'message' || action === 'invite' || action === 'show profile' || action === 'remove friend' || action === 'block'){
      
        if (action === 'message') {
          if (otherUser !== this.getAttribute('data-username')) {
            otherUser = this.getAttribute('data-username');
          }
          selectTab('tab2');
          return;
        }
      
      sendPostUserRequest(action, friendUsername)
      .then(data => {
      console.log('İşlem başarılı:', data);
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




async function changeContentProfile(contentId) {
  console.log('İçerik değiştiriliyor:', contentId);
  if (localStorage.getItem('contentData') === null) {
    fetch('api/content/')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('contentData', JSON.stringify(data));
      })
  .catch(error => console.error('Error:', error));
  var contentData = JSON.parse(localStorage.getItem('contentData'));
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
    history.pushState({ id: contentId, htmlContent: htmlContent, profileContent: true }, null, null);
    if (contentId === 'friends') {
      listFriends();
      pendingFriendRequests();
      addfriendListener();
    }
    else if (contentId === 'account') {
      accountListener();
    }

    triggerContentLoad(contentId);
  }
  checkAuthStatus();

}

window.onpopstate = function(event) {
  if (event.state) {
    var mainContent = document.getElementById('main-content');
    var contentProfile = document.getElementById('content-profile');
    
    // Check if 'content-profile' exists before setting its innerHTML
    if (contentProfile && event.state.profileContent) {
      contentProfile.innerHTML = event.state.htmlContent;
    } else if (mainContent && !event.state.profileContent) {
      mainContent.innerHTML = event.state.htmlContent;
    }
    triggerContentLoad(event.state.id);

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
 async function sendPostWithJwt(url, bodyData, method = 'POST') {
  try {
    const accessToken = getCookie('accessToken');
    let headers = new Headers({
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    });
    var methodData;
    // Multipart/form-data için Content-Type başlığını kaldır
    if (url === 'api/user/update_profile_pic/') {
      headers.delete('Content-Type');
      methodData = bodyData;
    }
    else if (method === 'GET') {
      methodData = null;
    }
    else {
      methodData = JSON.stringify(bodyData);
    }
    // if (method === 'POST' && bodyData instanceof FormData) {
    //   headers.delete('Content-Type');
    // }

    let response = await fetch(url, {
      method: method,
      headers: headers,
      body: methodData,
    });

    // Eğer yanıt 401 ise, token yenileme fonksiyonunu çağır
    if (response.status === 401) {
      const newAccessToken = await refreshAccessToken();
      headers.set('Authorization', 'Bearer ' + newAccessToken);
      response = await fetch(url, {
        method: method,
        headers: headers,
        body: methodData,
      });
    }

    // İkinci isteğin sonucunu al
    const data = await response.json();
    return data; // İşlem başarılıysa veriyi dön
  } catch (error) {
    // Hata oluşursa burada ele al
    console.error('İstek sırasında bir hata oluştu:', error);
    throw error; // Hata bilgisini dışarı fırlat
  }
}


async function sendPostUserRequest(action, friend_username = null) {
  try {
    console.log('İstek gönderiliyor:', action, friend_username);
    const accessToken = getCookie('accessToken');
    let headers = new Headers({
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    });

    const bodyData = { 'action': action };
    if (friend_username) {
      bodyData['friend_username'] = friend_username;
    }
    const body = JSON.stringify(bodyData);

    let response = await fetch('api/user/user_actions/', {
      method: 'POST',
      headers: headers,
      body: body
    });

    if (response.status === 401) {
      // Eğer yanıt 401 ise, token yenileme fonksiyonunu çağır
      const newAccessToken = await refreshAccessToken();
      // Yeni access token ile headerları güncelle
      headers = new Headers({
        'Authorization': 'Bearer ' + newAccessToken,
        'Content-Type': 'application/json'
      });
      // İsteği yeni token ile tekrar gönder
      response = await fetch('api/user/user_actions/', {
        method: 'POST',
        headers: headers,
        body: body
      });
    }

    // İkinci isteğin sonucunu al
    const data = await response.json();
    return data; // İşlem başarılıysa veriyi dön
  } catch (error) {
    // Hata oluşursa burada ele al
    console.error('İstek sırasında bir hata oluştu:', error);
    throw error; // Hata bilgisini dışarı fırlat
  }
}


async function refreshAccessToken() {
  // Refresh token'ı cookie'den alın
  const refreshToken = getCookie('refreshToken');
  const response = await fetch('api/auth/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (!response.ok) {
    throw new Error('Token yenileme isteği başarısız oldu.');
  }

  const data = await response.json();
  if (data.access) {
    // Yeni access token'ı cookie'ye kaydedin
    setCookie('accessToken', data.access, {secure: true});
    console.log('Access token successfully refreshed');
    return data.access;
  } else {
    throw new Error('Access token refresh failed: ' + data.error);
  }
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

// function refreshAccessToken() {
//   // Refresh token'ı cookie'den alın
//   const refreshToken = getCookie('refreshToken');

//   fetch('api/auth/token/refresh/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({ refresh: refreshToken })
//   })
//   .then(response => {
//     if (!response.ok) {
//       throw new Error('Network response was not ok');
//     }
//     return response.json();
//   })
//   .then(data => {
//     if (data.access) {
//       // Yeni access token'ı cookie'ye kaydedin
//       setCookie('accessToken', data.access, {secure: true});
//       // Access token yenilendi, işlemlere devam edin
//       console.log('Access token successfully refreshed');
//     } else {
//       // Hata mesajını göster
//       alert('Access token refresh failed: ' + data.error);
//     }
//   })
//   .catch(error => {
//     console.error('There has been a problem with your fetch operation:', error);
//   });
// }




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





// Özel sohbet penceresini açma fonksiyonu
// function openPrivateChatWindow(targetUsername) {
//   // Özel sohbet için bir div oluştur
//   const privateChatDiv = document.createElement('div');
//   privateChatDiv.id = 'private_chat_' + targetUsername;
//   privateChatDiv.classList.add('private-chat-container');

//   // Özel sohbet başlığını ekle
//   const chatHeader = document.createElement('div');
//   chatHeader.classList.add('chat-header');
//   chatHeader.textContent = targetUsername + ' ile Özel Sohbet';
//   privateChatDiv.appendChild(chatHeader);

//   // Mesajları gösterecek bir div ekle
//   const messagesDiv = document.createElement('div');
//   messagesDiv.classList.add('chat-messages');
//   privateChatDiv.appendChild(messagesDiv);

//   // Mesaj gönderme formunu ekle
//   const form = document.createElement('form');
//   form.onsubmit = function(e) {
//     e.preventDefault();
//     sendPrivateMessage(targetUsername);
//   };

//   const input = document.createElement('input');
//   input.type = 'text';
//   input.id = 'private_message_input_' + targetUsername;
//   input.classList.add('chat-input');
//   input.placeholder = 'Mesajınızı yazın...';
//   form.appendChild(input);

//   const sendButton = document.createElement('button');
//   sendButton.type = 'submit';
//   sendButton.textContent = 'Gönder';
//   form.appendChild(sendButton);

//   privateChatDiv.appendChild(form);

//   // Pencereyi belgeye ekle
//   document.body.appendChild(privateChatDiv);

//   // WebSocket bağlantısını aç
//   openPrivateChatSocket(targetUsername, messagesDiv);
// }

// // Özel sohbet için WebSocket bağlantısını açma fonksiyonu
// function openPrivateChatSocket(targetUsername, messagesDiv) {
//   const privateChatSocket = new WebSocket('ws://' + window.location.host + '/ws/private_chat/' + targetUsername + '/');

//   // Gelen mesajları işle
//   privateChatSocket.onmessage = function(e) {
//     const data = JSON.parse(e.data);
//     const messageDiv = document.createElement('div');
//     messageDiv.textContent = data.username + ': ' + data.message;
//     messagesDiv.appendChild(messageDiv);
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   };

//   // WebSocket bağlantısını kapatma durumunu işle
//   privateChatSocket.onclose = function(e) {
//     console.error(targetUsername + ' ile özel sohbet kapandı');
//   };

//   // Mesaj gönderme fonksiyonu
//   function sendPrivateMessage(targetUsername) {
//     const input = document.getElementById('private_message_input_' + targetUsername);
//     const message = input.value;
//     const username = getCookie('username');

//     if (privateChatSocket) {
//       privateChatSocket.send(JSON.stringify({ 'message': message, 'username': username }));
//     }
//     input.value = '';
//   }
// }


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

  // const contentData = JSON.parse(document.getElementById('content-data').textContent);
  // localStorage.setItem('contentData', JSON.stringify(contentData));
  checkAuthStatus();
  hrefListener();
  openSocketPrivate();
  openSocket();
  //refreshAccessToken();
  //selectTab('tab1');
 
});
  
/*
 .----------------.  .----------------.  .----------------.  .----------------. 
| .--------------. || .--------------. || .--------------. || .--------------. |
| |     ______   | || |  ____  ____  | || |      __      | || |  _________   | |
| |   .' ___  |  | || | |_   ||   _| | || |     /  \     | || | |  _   _  |  | |
| |  / .'   \_|  | || |   | |__| |   | || |    / /\ \    | || | |_/ | | \_|  | |
| |  | |         | || |   |  __  |   | || |   / ____ \   | || |     | |      | |
| |  \ `.___.'\  | || |  _| |  | |_  | || | _/ /    \ \_ | || |    _| |_     | |
| |   `._____.'  | || | |____||____| | || ||____|  |____|| || |   |_____|    | |
| |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------' 
 */



// async function requestNotificationPermission() {
//   try {
//     const permission = await Notification.requestPermission();
//     if (permission === 'granted') {
//       console.log('Notification permission granted.');
//     } else {
//       console.log('Notification permission denied.');
//     }
//   } catch (error) {
//     console.error('Error requesting notification permission:', error);
//   }
// }

// // Call this function when the page loads or when the user logs in
// requestNotificationPermission();



// function incrementNotificationCount() {
//   var countElement = document.getElementById('notificationCount');
//   var currentCount = parseInt(countElement.textContent);
//   countElement.textContent = currentCount + 1;
// }

// function addNotification(notificationData) {
//   // Bildirim sayısını artıran fonksiyonu çağır
//   incrementNotificationCount();
  
//   // Bildirimleri gösterecek bir konteyner oluştur (Eğer henüz yoksa)
//   var notificationsContainer = document.getElementById('notificationsContainer');
//   if (!notificationsContainer) {
//     notificationsContainer = document.createElement('div');
//     notificationsContainer.id = 'notificationsContainer';
//     document.body.appendChild(notificationsContainer);
//   }

//   // Yeni bir bildirim elementi oluştur
//   var notificationElement = document.createElement('div');
//   notificationElement.className = 'notification';
//   notificationElement.textContent = notificationData.from_user + ': ' + notificationData.message;

//   // Bildirim elementine tıklanma olayını ekle
//   notificationElement.onclick = function() {
//     // Bildirimi okundu olarak işaretle
//     markNotificationAsRead(notificationData.id);
//     // Bildirim elementini kaldır
//     notificationElement.remove();
//     // Sayaç değerini azalt
//     decrementNotificationCount();
//   };
// }


// let notificationSocket;
// function  openNotificationSocket(){
//   // Bildirimler için WebSocket bağlantısını açan fonksiyon
//   if  (notificationSocket && notificationSocket.readyState === WebSocket.OPEN) {
//     return;
//   }

//   notificationSocket = new WebSocket('ws://' + window.location.host + '/ws/notifications/?token=' + getCookie('accessToken'));
//   notificationSocket.onmessage = function(e) {
//     const data = JSON.parse(e.data);
//     console.log('Bildirim geldi:', data);
//     // Bildirim sayısını artıran fonksiyonu çağır
//     // incrementNotificationCount();
//     // // Bildirimleri gösteren fonksiyonu çağır
//     // addNotification(data);

// }}
// openNotificationSocket();

function showTab2WithUsername(username) {
  const tab2 = document.getElementById('tab2');
  tab2.textContent = username; // Sekme 2'nin metnini güncelle
  tab2.style.display = 'block'; // Sekme 2'yi göster
  selectTab('tab2'); // Sekme 2'yi seçili hale getir
}
// Bildirim butonunu güncelleme fonksiyonu
function updateNotificationButton(username) {
  const notificationButton = document.getElementById('notification_button');
  notificationButton.textContent = `Yeni mesajlar (${username})`;
  notificationButton.style.display = 'block'; // Bildirim butonunu göster
}

// Cookie'ye mesaj ekleyen fonksiyon
function addMessageToCookie(username, message) {
  // Mevcut cookie değerini al
  const existingCookie = document.cookie.split('; ').find(row => row.startsWith('chat_messages='));
  const messages = existingCookie ? existingCookie.split('=')[1].split('|') : [];

  // Yeni mesajı ve zaman damgasını mevcut mesajlara ekle
  const now = new Date();
  messages.push(`${now.toISOString()}|${username}: ${message}`);

  // Eğer mesaj sayısı 50'den fazlaysa, en eski mesajları sil
  if (messages.length > 50) {
    messages.splice(0, messages.length - 50);
  }

  // Cookie'yi güncelle
  const time = now.getTime();
  const expireTime = time + 1000 * 36000; // 10 saat sonra sona erecek
  now.setTime(expireTime);

  // Cookie'de saklanacak mesaj formatı
  const cookieValue = messages.join('|');
  document.cookie = `chat_messages=${cookieValue};expires=${now.toUTCString()};path=/;SameSite=None; Secure`;
}




// Global olarak WebSocket bağlantısını tanımla
let chatSocketPrivate
let otherUser = '';

// WebSocket bağlantısını aç
function openSocketPrivate() {
  if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
    return;
  }
  chatSocketPrivate = new WebSocket(`wss://${window.location.host}/ws/chatPrivate/?token=` + getCookie('accessToken'));

  chatSocketPrivate.onopen = function(e) {
    console.log('WebSocket bağlantısı açıldı:', e);
  };

  chatSocketPrivate.onerror = function(e) {
    console.error('WebSocket hatası:', e);
  };

  chatSocketPrivate.onmessage = function(e) {
    // Gelen mesajları işle
    const data = JSON.parse(e.data);
     // Mesajları cookie'de sakla
     addMessageToCookie(data.username, data.message);
    if (data.username !== getCookie('username') && data.username !== otherUser) {
      updateNotificationButton(data.username);
      return;
    }
  
   
    // Mesajın hangi odaya ait olduğunu kontrol et
    const chatMessages = document.getElementById('chat_messages2');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (data.username !== getCookie('username')) {

    showTab2WithUsername(data.username); // Sekme 2'yi göster ve kullanıcı adını güncelle
    }
  };
  

  chatSocketPrivate.onclose = function(e) {
    console.error('WebSocket bağlantısı kapandı:', e);
  };
}

// Odaya katılma komutunu gönder
function joinRoom(friendUsername) {
  if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
    const message = {
      command: 'join',
      friend: friendUsername
    };
    chatSocketPrivate.send(JSON.stringify(message));
  } else {
    console.error('WebSocket bağlantısı açık değil.');
  }
}

// Odayı terk etme komutunu gönder
function leaveRoom(friendUsername) {
  if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
    const message = {
      command: 'leave',
      friend: friendUsername
    };
    chatSocketPrivate.send(JSON.stringify(message));
  } else {
    console.error('WebSocket bağlantısı açık değil.');
  }
}

// Mesaj gönderme komutunu gönder
function sendMessage(text) {
  if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
    const message = {
      command: 'send',
      friend: otherUser,
      message: text
    };
    chatSocketPrivate.send(JSON.stringify(message));
  } else {
    console.error('WebSocket bağlantısı açık değil.');
  }
}

// WebSocket bağlantısını aç



let chatSocket;
let activeTab = 'tab1';
function openSocket() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    return;
  }

  chatSocket = new WebSocket(`wss://${window.location.host}/ws/chat/?token=` + getCookie('accessToken'));
 
  chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('type:', data.type , 'data:', data);

    // Mesajın hangi odaya ait olduğunu kontrol et
    const chatMessages = document.getElementById('chat_messages1');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
  };

  chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
  };
}



// Sekme değiştirme fonksiyonu
function selectTab(selectedTabId) {
  // Sekmelerin stilini sıfırla
  const tabs = document.querySelectorAll('#tabs > div');
  tabs.forEach(function(tab) {
    tab.style.backgroundColor = '';
    tab.style.color = '';
  });

  // Seçili sekme stilini ayarla
  const selectedTab = document.getElementById(selectedTabId);
  selectedTab.style.backgroundColor = '#0d61d7';
  selectedTab.style.color = 'black';

  // Mesaj kutularının görünürlüğünü ayarla
  document.getElementById('chat_messages1').style.display = selectedTabId === 'tab1' ? 'block' : 'none';
  document.getElementById('chat_messages2').style.display = selectedTabId === 'tab2' ? 'block' : 'none';
  activeTab = selectedTabId;

}

// Sekme tıklama olaylarını tanımla
document.getElementById('tab1').addEventListener('click', function(event) {
  event.stopPropagation();
  selectTab('tab1');
});
document.getElementById('tab2').addEventListener('click', function(event) {
  event.stopPropagation();
  selectTab('tab2');
});



// WebSocket bağlantısını kapatan fonksiyon
function closeSocket() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.close();
  }
}



// function incrementNotificationCount() {
//   var countElement = document.getElementById('notificationCount');
//   var currentCount = parseInt(countElement.textContent);
//   countElement.textContent = currentCount + 1;
// }

// function addNotification(notificationData) {
//   // Bildirim sayısını artıran fonksiyonu çağır
//   incrementNotificationCount();

//   // Bildirimleri gösterecek bir konteyner oluştur (Eğer henüz yoksa)
//   var notificationsContainer = document.getElementById('notificationsContainer');
//   if (!notificationsContainer) {
//       notificationsContainer = document.createElement('div');
//       notificationsContainer.id = 'notificationsContainer';
//       document.body.appendChild(notificationsContainer);
//   }

//   // Yeni bir bildirim elementi oluştur
//   var notificationElement = document.createElement('div');
//   notificationElement.className = 'notification';
//   notificationElement.textContent = notificationData.from_user + ': ' + notificationData.message;

//   // Bildirim elementine tıklanma olayını ekle
//   notificationElement.onclick = function() {
//       // Bildirimi okundu olarak işaretle
//       markNotificationAsRead(notificationData.id);
//       // Bildirim elementini kaldır
//       notificationElement.remove();
//       // Sayaç değerini azalt
//       decrementNotificationCount();
//   };

//   // Bildirim elementini konteynere ekle
//   notificationsContainer.appendChild(notificationElement);
// }

// // Bildirim okundu olarak işaretleyen fonksiyon
// function markNotificationAsRead(notificationId) {
//   // AJAX isteği ile sunucuya bildir
//   fetch('/mark-notification-as-read/' + notificationId, {
//       method: 'POST',
//       headers: {
//           'Content-Type': 'application/json',
//           'Authorization': 'Bearer ' + getCookie('accessToken') // CSRF token eklemeyi unutmayın
//       },
//       body: JSON.stringify({ 'is_read': true })
//   })
//   .then(response => response.json())
//   .then(data => {
//       console.log('Bildirim okundu olarak işaretlendi:', data);
//       // Sayaç değerini azalt
//       decrementNotificationCount();
//   })
//   .catch((error) => {
//       console.error('Hata:', error);
//   });
// }

// // Bildirim sayısını azaltan fonksiyon
// function decrementNotificationCount() {
//   var countElement = document.getElementById('notificationCount');
//   var currentCount = parseInt(countElement.textContent);
//   if (currentCount > 0) {
//       countElement.textContent = currentCount - 1;
//   }
// }
// // let otherUsername =  getCookie('username') === 'test' ? 'lol' : 'test';



 document.getElementById('chat_input').onkeypress = function(e) {
  if (e.keyCode === 13) {  // Enter tuşu
    document.getElementById('chat_send').click();
   }
 };

 
 // Toggle chat box function

// Add event listener to chat bar

 function toggleFriendList() {
  var friendList = document.getElementById('friend-list');
  var chatContainer = document.getElementById('chat_container');
  var chatBbar = document.getElementById('chat_bar');
  var chatIcon = document.getElementById('chat_icon');


  var isFriendListVisible = friendList.style.display === 'block';

  // Arkadaş listesinin görünürlüğünü değiştir
  friendList.style.display = isFriendListVisible ? 'none' : 'block';

  // Eğer arkadaş listesi görünürse, chat_container'ı sola kaydır
  chatContainer.style.right = isFriendListVisible ? '10px' : '250px';
  chatBbar.style.right = isFriendListVisible ? '10px' : '250px';
  chatIcon.style.right = isFriendListVisible ? '330px' : '600px';
  if (!isFriendListVisible) {
    fetchAndDisplayFriends(); // Arkadaş listesini temizle
  }
}

// get_user_info fonksiyonundan gelen veriyi işleme
// Arkadaş listesini al ve ekranda göster
function fetchAndDisplayFriends() {
  sendPostUserRequest('list_friends')
    .then(data => {
      // Arkadaş listesini al
      const friends = data.friends;
      // Arkadaş listesini ekranda göster
      displayFriends(friends);
    })
    .catch(error => {
      console.error('Arkadaş listesi alınamadı:', error);
    });
}

// Bildirim sayısını güncelleyen fonksiyon
function updateNotificationCount(username, count) {
  const userLink = document.querySelector(`[data-username="${username}"]`);
  let notificationSpan = userLink.querySelector('.notification-count');
  
  if (!notificationSpan) {
    // Eğer bildirim sayacı span'ı yoksa, yeni bir tane oluştur
    notificationSpan = document.createElement('span');
    notificationSpan.classList.add('notification-count');
    userLink.appendChild(notificationSpan);
  }
  
  if (count > 0) {
    notificationSpan.textContent = count; // Bildirim sayısını güncelle
    notificationSpan.style.display = 'block'; // Bildirim sayacını göster
  } else {
    notificationSpan.style.display = 'none'; // Bildirim sayacını gizle
  }
}

// Cookie'den mesajları alıp gösteren fonksiyon
function displayMessagesFromCookie() {
  const chatMessages = document.getElementById('chat_messages2');
  chatMessages.innerHTML = ''; // Clear current messages

  // Get 'chat_messages' cookie
  const allCookies = document.cookie.split('; ');
  const chatCookie = allCookies.find(row => row.startsWith('chat_messages='));
  if (chatCookie) {
    // Get all messages from the cookie and split by '|'
    const messages = chatCookie.split('=')[1].split('|');

    // Display messages and timestamps
    messages.forEach(message => {
      const [timeStamp, userMessage] = message.split(',');
      const time = new Date(timeStamp);
      const timeFormatted = time.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const messageDiv = document.createElement('div');
      messageDiv.textContent = `${userMessage} (${timeFormatted})`;
      chatMessages.appendChild(messageDiv);
    });
  }
  chatMessages.scrollTop = chatMessages.scrollHeight;
}


// Arkadaş listesini güncelleyen ve olay dinleyicileri ekleyen fonksiyon
function displayFriends(friends) {
  const friendListContainer = document.getElementById('friend-list');
  friendListContainer.innerHTML = ''; // Mevcut listeyi temizle

  friends.forEach(friend => {
    const friendElement = document.createElement('div');
    friendElement.classList.add('friend-item');
    friendElement.innerHTML = `
      <p>
        <a href="#" class="link-underline-dark" data-username="${friend.username}">
          <img src="${friend.profile_picture}" alt="${friend.username}">
          <span>${friend.username}</span>
        </a>
      </p>`;
    friendListContainer.appendChild(friendElement);
  });

  // Kullanıcı adına tıklama olayını tanımla
  document.querySelectorAll('.friend-item .link-underline-dark').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      const username = this.getAttribute('data-username');
     // Bildirim sayısını sıfırla
      // Görünümü güncelle
      if (otherUser !== username) {
          otherUser = username; // Diğer kullanıcının adını güncelle
        }
      selectTab('tab2');
      displayMessagesFromCookie(username); // Cookie'deki mesajları göster
      updateNotificationCount(username, '');       
      var chatContainer = document.getElementById('chat_container');
      var chatBar = document.getElementById('chat_bar');
      chatContainer.style.height = '285px';
      chatBar.style.bottom = '310px';
    });
  });
}



// function displayFriends(friends) {
//   const friendListContainer = document.getElementById('friend-list');
//   friendListContainer.innerHTML = ''; // Mevcut listeyi temizle

//   friends.forEach(friend => {
//     const friendElement = document.createElement('div');
//     friendElement.classList.add('friend-item');
//     friendElement.innerHTML = `
//       <p>
//         <a href="#" class="link-underline-dark" data-username="${friend.username}">
//           <img src="${friend.profile_picture}" alt="${friend.username}">
//           <span>${friend.username}</span>
//         </a>
//       </p>`;
//     friendListContainer.appendChild(friendElement);
//   });


//   document.querySelectorAll('.friend-item .link-underline-dark').forEach(item => {
//     item.addEventListener('click', function(event) {
//       event.preventDefault();
//       if (otherUser !== this.getAttribute('data-username')) {
//         otherUser = this.getAttribute('data-username'); // Diğer kullanıcının adını güncelle
//       }
//       // closeSocket(); // Önceki WebSocket bağlantısını kapat
//       selectTab('tab2'); // Özel sohbet sekmesini aktif hale getir

//       var chatContainer = document.getElementById('chat_container');
//       // var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';
//       var chatBar = document.getElementById('chat_bar');
//       chatContainer.style.height =  '285px';
//       chatBar.style.bottom =  '310px'; // 'this' ile chatBar'ı güncelle
//     });
//   });
// }


document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  const username = getCookie('username'); // Gönderen kullanıcının adını al

  if (chatSocketPrivate && activeTab === 'tab2') {
    sendMessage(message);
    showTab2WithUsername(otherUser);
  } else {
  // Mesajı WebSocket üzerinden gönder
  if (chatSocket) {
    chatSocket.send(JSON.stringify({
      'message': message,
      'username': username,
      'room': 'global'
    }));
  }}
  messageInput.value = '';
};



// İkona tıklama olayını dinleme ve arkadaş listesini göster
document.getElementById('chat_icon').addEventListener('click', function() {
  toggleFriendList(); // Bu fonksiyon daha önce tanımlanmış olmalı
  // fetchAndDisplayFriends();
});





// Chat bar'a tıklandığında chat container'ı aç/kapa
document.getElementById('chat_bar').addEventListener('click', function() {
  var chatContainer = document.getElementById('chat_container');
  var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';

  // Sohbet penceresinin yüksekliğini ve gri çubuğun alt pozisyonunu güncelle
  chatContainer.style.height = isClosed ? '285px' : '0px';
  this.style.bottom = isClosed ? '310px' : '10px'; // 'this' ile chatBar'ı güncelle
});



 /*

 .----------------.  .-----------------. .----------------. 
| .--------------. || .--------------. || .--------------. |
| |  _________   | || | ____  _____  | || |  ________    | |
| | |_   ___  |  | || ||_   \|_   _| | || | |_   ___ `.  | |
| |   | |_  \_|  | || |  |   \ | |   | || |   | |   `. \ | |
| |   |  _|  _   | || |  | |\ \| |   | || |   | |    | | | |
| |  _| |___/ |  | || | _| |_\   |_  | || |  _| |___.' / | |
| | |_________|  | || ||_____|\____| | || | |________.'  | |
| |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------' 
 */
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
 
