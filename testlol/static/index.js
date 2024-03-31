function logout() {
  // Sunucuya logout isteği gönder
  fetch('auth/logout/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // JWT'nizi burada gönderin
      'Authorization': 'Bearer ' + getCookie('accessToken')
    }
  }).then(response => {
    // Gerekli temizlik işlemlerini yapın
    // Örneğin, cookie'leri silin
    deleteCookie('accessToken');
    deleteCookie('refreshToken');
    deleteCookie('username');
    // Kullanıcıyı giriş sayfasına yönlendir
    changeContent('sign-in');
  });
}



function login() {
  const username_or_email = document.getElementById('login-username_or_email').value;
  const password = document.getElementById('login-password').value;

  fetch('auth/login/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({username_or_email, password})
  })
  .then(response => response.json())
  .then(data => {
    if(data.access) {
      // Access ve refresh token'ları cookie'ye kaydedin
      console.log(data.access);
      console.log(data.refresh);
      console.log(data.username);
      setCookie('accessToken', data.access, {secure: true});
      setCookie('refreshToken', data.refresh, {secure: true});
      setCookie('username', data.username, {secure: true});
      // JavaScript tarafından erişilebilir cookie'ler için HttpOnly bayrağını kaldırın
// setCookie('accessToken', data.access, {secure: true});
// setCookie('refreshToken', data.refresh, {secure: true});

      // Login başarılı, ana sayfaya yönlendir
      changeContent('user_profile'); // Örnek bir yönlendirme
    } else {
      // Hata mesajını göster
      alert('Giriş başarısız: ' + data.error);
    }
  });
}

// Cookie ayarlama fonksiyonu
// Cookie ayarlama fonksiyonu
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



function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const email = document.getElementById('register-email').value;
  //const token = localStorage.getItem('jwt');

  fetch('auth/register/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password, email})
  })
  .then(response => response.json())
  .then(data => {
      if(data.success) {
        changeContent('home');
        console.log(data.success);
      } else {
        console.log(data.error);
      }
  });
}

// JWT ile güvenli bir GET isteği gönderme fonksiyonu
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

// Profil linkine tıklama olayını dinle
const profileLink = document.getElementById('profile-link');
profileLink.addEventListener('click', (event) => {
  event.preventDefault();
  sendGetRequestWithJwt('guest/profile/')
    .then(data => {
      // Profil bilgilerini göstermek için bir fonksiyon çağırabilirsiniz
      // displayProfile(data);
    })
    .catch(error => {
      // Hata mesajını kullanıcıya göstermek için bir fonksiyon çağırabilirsiniz
      // showError(error);
    });
});



  
async function changeContent(contentId) {
  if (localStorage.getItem('contentData') === null) {
    const contentData = JSON.parse(document.getElementById('content-data').textContent);
    localStorage.setItem('contentData', JSON.stringify(contentData));
  }
  else {
    var contentData = JSON.parse(localStorage.getItem('contentData'));
  }
  const htmlContent =contentData[contentId];
  document.getElementById('main-content').innerHTML = htmlContent;
  checkAuthStatus();
  history.pushState({ id: contentId, htmlContent: htmlContent }, null, null);
 
}

  const homeLink = document.getElementById('home-link');
  const signInLink = document.getElementById('sign-in-link');
  const signUpLink = document.getElementById('sign-up-link');

  homeLink.addEventListener('click', (event) => {
    event.preventDefault();
    changeContent('home');
  });
  
  signInLink.addEventListener('click', (event) => {
    event.preventDefault();
    changeContent('sign-in');
  });
  
  signUpLink.addEventListener('click', (event) => {
    event.preventDefault();
    changeContent('sign-up');
  });


 

window.onpopstate = function(event) {
  if (event.state) {
    document.getElementById('main-content').innerHTML = event.state.htmlContent;
  }
};


function checkAuthStatus() {
  const accessToken = localStorage.getItem('accessToken');
  const signInLink = document.getElementById('sign-in-link');
  const signUpLink = document.getElementById('sign-up-link');
  const profileLink = document.getElementById('profile-link');
  const logoutButton = document.querySelector('button[onclick="logout()"]');
  const chat_boxlink = document.getElementById('chat_container');

  // if (accessToken) {
  //   // Kullanıcı oturum açmışsa, giriş ve kayıt linklerini gizle
  //   signInLink.style.display = 'none';
  //   signUpLink.style.display = 'none';
  //   // Profil ve çıkış butonlarını göster
  //   profileLink.style.display = 'block';
  //   logoutButton.style.display = 'block';
  //   chat_boxlink.style.display = 'block';
  // } else {
  //   // Kullanıcı oturum açmamışsa, profil ve çıkış butonlarını gizle
  //   profileLink.style.display = 'none';
  //   logoutButton.style.display = 'none';
  //   chat_boxlink.style.display = 'block';
  //   // Giriş ve kayıt linklerini göster
  //   signInLink.style.display = 'block';
  //   signUpLink.style.display = 'block';
  // }
}

document.addEventListener('DOMContentLoaded', (event) => {
  // Oturum durumunu kontrol etmek için bir fonksiyon
  const contentData = JSON.parse(document.getElementById('content-data').textContent);
  localStorage.setItem('contentData', JSON.stringify(contentData));
  checkAuthStatus();
});
  // Sayfa yüklendiğinde oturum durumunu kontrol et
 // checkAuthStatus();

  // Oturum açma ve kapatma işlemlerinden sonra oturum durumunu güncelle
  window.addEventListener('storage', (event) => {
    if (event.key === 'accessToken') {
      checkAuthStatus();
    }
  });


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
const chatSocket = new WebSocket('ws://' + window.location.host + '/');

// Mesaj gönderme işlevi
document.getElementById('chat_send').onclick = function() {
  const messageInput = document.getElementById('chat_input');
  const message = messageInput.value;
  // 'username' anahtarını mesaj objesine ekleyin.
  // const username = localStorage.getItem('username');
  const username = getCookie('username') // veya localStorage

  chatSocket.send(JSON.stringify({ 'message': message, 'username': username }));
  messageInput.value = '';
};


// Enter tuşu ile mesaj gönderme
document.getElementById('chat_input').onkeypress = function(e) {
    if (e.keyCode === 13) {  // Enter tuşu
        document.getElementById('chat_send').click();
    }
};

// Gelen mesajları işleme
chatSocket.onmessage = function(e) {
const data = JSON.parse(e.data);
const chatMessages = document.getElementById('chat_messages');
const messageDiv = document.createElement('div');
// Kullanıcı adını ve mesajı formatlayın.
messageDiv.textContent = data.username + ': ' + data.message;
chatMessages.appendChild(messageDiv);
chatMessages.scrollTop = chatMessages.scrollHeight;  // Otomatik kaydırma
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};