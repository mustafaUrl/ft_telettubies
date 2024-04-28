import  {setCookie}  from '../../cookies/cookies.js';
import  changeContent  from '../../uimodule/changeContent.js';
import   openSocket  from '../../sockets/globalSocket.js';
import  openSocketPrivate  from '../../sockets/privateSocket.js';
import { selectTab } from '../../uimodule/chatBox.js';
import ft_login from './42login.js'


export default function login() {

  document.getElementById('42intra').addEventListener('click', function(e) {
    e.preventDefault();
    console.log('42 login');
    ft_login();

  });

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
  .then(response => response.json())
  .then(data => {
    if (data.two_factor_required) {
      // 2FA kodunu girmek için pop-up pencere aç
      const twoFactorCode = prompt('Lütfen iki faktörlü doğrulama kodunuzu giriniz:');
      if (twoFactorCode) {
        // 2FA kodunu doğrulamak için başka bir API isteği gönder
        fetch('api/auth/verify-2fa/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ user_username: data.user_username, token: twoFactorCode })
        })
        .then(response => response.json())
        .then(data => {
          if (data.access){
            setCookie('accessToken', data.access, {secure: true});
          setCookie('refreshToken', data.refresh, {secure: true});
          setCookie('username', data.username, {secure: true});
          selectTab('tab1');
          openSocket();
          openSocketPrivate();
          // setInterval(refreshAccessToken, 4 * 60 * 1000); 
          // Login başarılı, ana sayfaya yönlendir
          // window.location.href = '/user_profile'; // Örnek bir yönlendirme
          changeContent('home');
          }
        })
        .catch(error => {
          console.error('2FA doğrulama hatası:', error);
        });
      }
    } else if (data.access) {
      setCookie('accessToken', data.access, {secure: true});
          setCookie('refreshToken', data.refresh, {secure: true});
          setCookie('username', data.username, {secure: true});
          selectTab('tab1');
          openSocket();
          openSocketPrivate();
          // setInterval(refreshAccessToken, 4 * 60 * 1000); 
          // Login başarılı, ana sayfaya yönlendir
          // window.location.href = '/user_profile'; // Örnek bir yönlendirme
          changeContent('home');
    } else {
      // Hata mesajını göster
      alert('Giriş başarısız: ' + data.error);
    }
  })
  .catch(error => {
    console.error('Giriş işlemi sırasında bir hata oluştu:', error);
  });
});

}

// export default function login() {
//     // Giriş formu işlevselliğini burada etkinleştir
//     document.getElementById('login-form').addEventListener('submit', function(e) {
//       e.preventDefault();
//       const username_or_email = document.getElementById('InputUserOrEmail').value;
//       const password = document.getElementById('InputPassword').value;
//       fetch('api/auth/login/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ username_or_email, password })
//       })
//       .then(response => {
//         if (!response.ok) {
//           throw new Error('Network response was not ok');
//         }
//         return response.json();
//       })
//       .then(data => {
//         if (data.access) {
//           setCookie('accessToken', data.access, {secure: true});
//           setCookie('refreshToken', data.refresh, {secure: true});
//           setCookie('username', data.username, {secure: true});
//           selectTab('tab1');
//           openSocket();
//           openSocketPrivate();
//           // setInterval(refreshAccessToken, 4 * 60 * 1000); 
//           // Login başarılı, ana sayfaya yönlendir
//           // window.location.href = '/user_profile'; // Örnek bir yönlendirme
//           changeContent('home');

//         } else {
//           // Hata mesajını göster
//           alert('Giriş başarısız: ' + data.error);
//         }
//       })
//       .catch(error => {
//         console.error('There has been a problem with your fetch operation:', error);
//       });
//     });
//   }
