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
  
export default function ft_login() {
// URL'den 'code' parametresini parse edin
window.location.href="https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-16b6c7462b738938b4c6b763f4d804a957769bb2e68fc5e727f86a1e219347e5&redirect_uri=https%3A%2F%2Flocalhost&response_type=code";

// Sayfa yüklendiğinde URL'deki 'code' parametresini kontrol edin



}
