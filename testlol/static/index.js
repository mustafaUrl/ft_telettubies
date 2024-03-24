function logout() {
  // Local storage'dan access ve refresh token'ları sil
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');

  // Kullanıcıyı giriş sayfasına yönlendir
  changeContent('sign-in');
}


function login() {
  const username_or_email = document.getElementById('login-username_or_email').value;
  const password = document.getElementById('login-password').value;

  fetch('/api/login/', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({username_or_email, password})
  })
  .then(response => response.json())
  .then(data => {
      if(data.access) {
          // Access ve refresh token'ları local storage'a kaydedin
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          // Login başarılı, ana sayfaya yönlendir
          changeContent('home'); // Örnek bir yönlendirme
          console.log(data.access);
      } else {
          // Hata mesajını göster
          alert('Giriş başarısız: ' + data.error);
      }
  });
}

function register() {
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const email = document.getElementById('register-email').value;
  //const token = localStorage.getItem('jwt');

  fetch('/api/register/', {
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

function fetchWithJwt(url, options = {}) {
  // JWT'yi local storage'dan al
  const accessToken = localStorage.getItem('accessToken');

  // Eğer bir access token varsa, Authorization header'ına ekle
  if (accessToken) {
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    };
  }

  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }
      return response;
    });
}

function sendGetRequestWithJwt(url) {
  return fetchWithJwt(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

const profileLink = document.getElementById('profile-link');

profileLink.addEventListener('click', (event) => {
  event.preventDefault();
  sendGetRequestWithJwt('/api/profile/')
    .then(response => {
      if (!response.ok) {
        throw new Error('Profil bilgileri alınamadı');
      }
      return response.json();
    })
    .then(data => {
      console.log('Profil bilgileri:', data);
      // Profil bilgilerini göstermek için bir fonksiyon çağırabilirsiniz
      // displayProfile(data);
    })
    .catch(error => {
      console.error(error);
      // Hata mesajını kullanıcıya göstermek için bir fonksiyon çağırabilirsiniz
      // showError(error);
    });
});



  
  async function changeContent(contentId) {
    // HTML içeriğini JSON olarak iste
    const response = await fetch(`http://127.0.0.1:8000/content/${contentId}`);
    const jsonData = await response.json();
  
    // Gelen JSON'dan HTML içeriğini al
    const htmlContent = jsonData.html_content;
  
    // Alınan HTML içeriğini main-content elementine ekle
    document.getElementById('main-content').innerHTML = htmlContent;
    
    checkAuthStatus();
    // History API kullanarak yeni bir durum ekle
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

  if (accessToken) {
    // Kullanıcı oturum açmışsa, giriş ve kayıt linklerini gizle
    signInLink.style.display = 'none';
    signUpLink.style.display = 'none';
    // Profil ve çıkış butonlarını göster
    profileLink.style.display = 'block';
    logoutButton.style.display = 'block';
  } else {
    // Kullanıcı oturum açmamışsa, profil ve çıkış butonlarını gizle
    profileLink.style.display = 'none';
    logoutButton.style.display = 'none';
    // Giriş ve kayıt linklerini göster
    signInLink.style.display = 'block';
    signUpLink.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  // Oturum durumunu kontrol etmek için bir fonksiyon
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

