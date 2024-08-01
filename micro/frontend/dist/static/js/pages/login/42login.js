// export default function login() {
//     const oauthUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-cb61d292fb0bcd76ddcd9a354f26ef42340e635f6bd2569977d565975e3bea24&redirect_uri=https%3A%2F%2Flocalhost%2Fapi%2Fft-auth%2F&response_type=code';
  
//     // Yeni bir pencerede OAuth sayfasını açın
//     const authWindow = window.open(oauthUrl, 'authWindow', 'width=800,height=600');
  
//     // Yeni pencereden gelen 'code' parametresini dinleyin
//     window.addEventListener('message', function(event) {
//       // Güvenlik için, event.origin'i kontrol edin
//       if (event.origin === 'https://localhost') {
//         const authCode = event.data; // 'code' parametresi burada olacak
  
//         // authCode ile Django view'ına bir POST isteği gönderin
//         fetch('https://localhost/api/ft-auth/', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({ code: authCode })
//         })
//         .then(response => response.json())
//         .then(data => {
//           // Sunucudan gelen yanıtı işleyin
//           console.log(data);
//         })
//         .catch(error => {
//           // Hata durumunda işlem yapın
//           console.error('Error:', error);
//         });
//       }
//     }, false);
//   }
import  {setCookie}  from '../../cookies/cookies.js';
import  changeContent  from '../../uimodule/changeContent.js';
import   openSocket  from '../../sockets/globalSocket.js';
import  openSocketPrivate  from '../../sockets/privateSocket.js';
import { selectTab } from '../../uimodule/chatBox.js';

export default function ft_login(authCode) {
// URL'den 'code' parametresini parse edin

// Sayfa yüklendiğinde URL'deki 'code' parametresini kontrol edin

    // 'code' parametresini backend'e gönderin
    fetch('api/auth/ft-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: authCode })
      })
      .then(response => response.json())
      .then(data => {
        if (data.two_factor_required) {
          // 2FA kodunu girmek için pop-up pencere aç
          const twoFactorCode = prompt('Please write 2FA code:');
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
              console.error('2FA authentication error:', error);
            });
          }
        } else if (data.access) {
              setCookie('accessToken', data.access, {secure: true});
              setCookie('refreshToken', data.refresh, {secure: true});
              setCookie('username', data.username, {secure: true});
              // selectTab('tab1');
              openSocket();
              openSocketPrivate();
              // setInterval(refreshAccessToken, 4 * 60 * 1000); 
              // Login başarılı, ana sayfaya yönlendir
              // window.location.href = '/user_profile'; // Örnek bir yönlendirme
              changeContent('home');
        } else {
          // Hata mesajını göster
          alert('Login failed: ' + data.error);
        }
      })
      .catch(error => {
        // Hata durumunda işlem yapın
        console.error('error:',  error.message);
      });
   


}
