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
          // openSocketForTab1();
          
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
  const accessToken = getCookie('accessToken');

  document.querySelector('.finput').addEventListener('click', function() {
    // Erişim belirtecinizi buraya ekleyin
  
    // Dosya seçim inputunu oluştur
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*'; // Sadece resim dosyalarını kabul et
    fileInput.onchange = e => {
      // Kullanıcının seçtiği dosyayı al
      const file = e.target.files[0];
      // FormData nesnesini oluştur ve dosyayı ekle
      const formData = new FormData();
      formData.append('profile_pic', file);
  
      // Sunucuya POST isteği yaparak dosyayı gönder
      fetch('api/user/update_profile_pic/', { // Sunucu tarafı yükleme endpoint'i
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json', bu satırı kaldırın çünkü multipart/form-data kullanıyoruz
          'Authorization': `Bearer ${accessToken}`
        },
        body: formData
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Başarılı yükleme sonrası profil resmini güncelle
        // 'data.newImageUrl' yerine doğru anahtarı kullanın, örneğin 'data.new_profile_pic_url'
        document.querySelector('.card-body img').src = data.new_profile_pic_url;
      })
      .catch(error => {
        console.error('error:', error);
      });
    };
  
    // Dosya seçim penceresini aç
    fileInput.click(); // Bu satır, programatik olarak dosya seçim penceresini açar
  });
  
  
  // Profil fotoğrafını güncellemek için düğmeye tıklama olayını dinle
  

  // Kullanıcı bilgilerini almak için API'ye istek yap
  fetch('api/user/get_info', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })
  .then(response => response.json())
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
    fetch('api/user/update_user/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(formData)
    })
    .then(response => response.json())
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
  console.log('İçerik değiştiriliyor:', contentId);
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
  
  console.log(contentData[contentId]);
  
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
  
  checkAuthStatus();
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
            closeSocket(); 
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
  console.log('İstek gönderiliyor:', action, friend_username);
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
    fetch('api/user/user_actions/', {
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

function refreshAccessToken() {
  // Refresh token'ı cookie'den alın
  const refreshToken = getCookie('refreshToken');

  fetch('api/auth/api/token/refresh/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ refresh: refreshToken })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    if (data.access) {
      // Yeni access token'ı cookie'ye kaydedin
      setCookie('accessToken', data.access, {secure: true});
      // Access token yenilendi, işlemlere devam edin
      console.log('Access token successfully refreshed');
    } else {
      // Hata mesajını göster
      alert('Access token refresh failed: ' + data.error);
    }
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

// Refresh token'ı belirli aralıklarla yenilemek için setInterval kullanın
setInterval(refreshAccessToken, 4 * 60 * 1000); // Her 4 dakikada bir yenile


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



// Global değişkenler

//  function selectTab(selectedTabId) {
//   var tabs = document.querySelectorAll('#tabs > div');
//   tabs.forEach(function(tab) {
//     if (tab.id === selectedTabId) {
//       tab.style.backgroundColor = '#0d61d7'; // Seçili sekme stilini ayarla
//       tab.style.color = 'black'; // Seçili sekme metin rengini ayarla
//     } else {
//       tab.style.backgroundColor = ''; // Diğer sekmelerin stilini sıfırla
//       tab.style.color = ''; // Diğer sekmelerin metin rengini sıfırla
//     }
//   });
// }

// // Sekmeler için tıklama olaylarını tanımla
// document.getElementById('tab1').addEventListener('click', function(event) {
//   event.stopPropagation();
//   selectTab('tab1'); // Sekme 1'i seç
//   openSocket();
//   });

//   document.getElementById('tab2').addEventListener('click', function(event) {
//   event.stopPropagation();
//   // closeSocket();
//   selectTab('tab2'); // Sekme 2'i seç
// });

// let chatSocket;

// function openSocket() {
//   // WebSocket bağlantısını açan fonksiyon
//   chatSocket = new WebSocket('ws://' + window.location.host + '/?token=' + getCookie('accessToken'));
let chatSocket;
let activeTab = 'tab1';
let privateChatRoom = '';
let otherUser = '';
function 
openSocket() {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    return;
  }
  if (otherUser === '') {
    chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/?token=` + getCookie('accessToken'));
  } else {

    chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${otherUser}/?token=` + getCookie('accessToken'));
  // chatSocket = new WebSocket('ws://' + window.location.host + '/ws/chat/?token=' + getCookie('accessToken'));
  }
  chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('type:', data.type , 'data:', data);

    // Mesajın hangi odaya ait olduğunu kontrol et
    const room = data.room || 'global';
    const chatMessages = document.getElementById(room === 'global' ? 'chat_messages1' : 'chat_messages2');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
  };
}

// Özel sohbet odasına mesaj gönderme fonksiyonu


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

  // WebSocket bağlantısını yeniden aç
  openSocket();

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



// document.getElementById('chat_input').onkeypress = function(e) {
//   if (e.keyCode === 13) {  // Enter tuşu
//     document.getElementById('chat_send').click();
//   }
// };

 
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


  document.querySelectorAll('.friend-item .link-underline-dark').forEach(item => {
    item.addEventListener('click', function(event) {
      event.preventDefault();
      if (otherUser !== this.getAttribute('data-username')) {
        otherUser = this.getAttribute('data-username'); // Diğer kullanıcının adını güncelle
        closeSocket(); // Önceki WebSocket bağlantısını kapat
      }
      // closeSocket(); // Önceki WebSocket bağlantısını kapat
      selectTab('tab2'); // Özel sohbet sekmesini aktif hale getir

      var chatContainer = document.getElementById('chat_container');
      var isClosed = chatContainer.style.height === '0px' || chatContainer.style.height === '';
      var chatBar = document.getElementById('chat_bar');
      chatContainer.style.height = isClosed ? '285px' : '0px';
      chatBar.style.bottom = isClosed ? '310px' : '10px'; // 'this' ile chatBar'ı güncelle
    });
  });
}


document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  const username = getCookie('username'); // Gönderen kullanıcının adını al

  // Mesajı WebSocket üzerinden gönder
  if (chatSocket) {
    console.log('activeTab:', activeTab , 'otherUser:', otherUser, 'username:', username, 'message:', message); 
    chatSocket.send(JSON.stringify({
      'message': message,
      'username': username,
      'room': activeTab === 'tab1' ? 'global' : `private_chat_${username}_${otherUser}`
    }));
  }
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
 
