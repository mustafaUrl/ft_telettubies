import  sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';


export default function accountListener() {
  
    document.querySelector('.finput').addEventListener('click', async function() {
      
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*'; 
      fileInput.onchange = async e => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('profile_pic', file);
        try {
        await sendPostWithJwt('api/user/update_profile_pic/', formData);
         
        } catch (error) {
          console.error('error:', error);
        }
      };
    
     
      fileInput.click(); 
    });
    

    document.getElementById('disable').addEventListener('click', async function() {
      // Popup penceresini oluşturun ve kullanıcıya gösterin
      let popupWindow = window.open('', 'Disable 2FA', 'width=400,height=400');
      popupWindow.document.write('<html><head><title>Disable 2FA</title></head><body>');
      popupWindow.document.write('<h1>Disable Two-factor Authentication</h1>');
      popupWindow.document.write('<p>Please enter the OTP code from your authenticator app to disable 2FA.</p>');
    
      // OTP kodunu girmek için bir input ve buton ekleyin
      popupWindow.document.write('<input id="otpInput" type="text" placeholder="Enter OTP code here"/>');
      popupWindow.document.write('<button id="disableOtp">Disable 2FA</button>');
      popupWindow.document.close();
    
      // Butona tıklandığında OTP kodunu doğrulayın ve 2FA'yı devre dışı bırakın
      popupWindow.document.getElementById('disableOtp').onclick = function() {
        let otpCode = popupWindow.document.getElementById('otpInput').value;
        // OTP kodunu sunucuya gönderin ve doğrulayın
        sendPostWithJwt('api/2fa/disable/', { token: otpCode })
        .then(disableData => {
          if(disableData.error) {
            popupWindow.alert('2FA could not be disabled: ' + disableData.error);
          } else {
            popupWindow.alert('2FA has been successfully disabled.');
            popupWindow.close(); // İşlem başarılıysa pencereyi kapat
          }
        })
        .catch(error => {
          console.error('An error occurred during 2FA deactivation:', error);
        });
      };
    });
    



    document.querySelector('.btn-secondary').addEventListener('click', async function() {
      // Sunucudan 2FA bilgilerini almak için sendPostWithJwt fonksiyonunu kullanın
      sendPostWithJwt('api/2fa/enable/', {
        // İstek gövdesi (eğer gerekliyse)
      })
      .then(data => {
        // Sunucudan gelen yanıtı işleyin
        if(data.error) {
          alert('Error: ' + data.error);
        } else {
          // Popup penceresini oluşturun ve kullanıcıya gösterin
          let popupWindow = window.open('', '2FA Popup', 'width=400,height=400');
          popupWindow.document.write('<html><head><title>2FA QR Code</title></head><body>');
          popupWindow.document.write('<h1 style="color: aqua;">Two-factor Authentication</h1>');
          popupWindow.document.write('<p>' + data.message + '</p>');
    
          // QR kodu oluşturmak için qrcode.js kütüphanesini kullanın
          let script = popupWindow.document.createElement('script');
          script.src = './static/js/pages/profile/qrcode.min.js';
          script.onload = function() {
            let qrCode = new QRCode(popupWindow.document.body, {
              text: data.otp_url, // Sunucudan gelen OTP URL'si
              width: 128,
              height: 128,
              colorDark: "#000000",
              colorLight: "#ffffff",
              correctLevel: QRCode.CorrectLevel.H
            });
          };
          popupWindow.document.body.appendChild(script);
    
          // OTP kodunu girmek için bir input ve buton ekleyin
          popupWindow.document.write('<input id="otpInput" type="text" placeholder="Enter OTP code here"/>');
          popupWindow.document.write('<button id="verifyOtp">Verify OTP</button>');
    
          popupWindow.document.write('<p>Secret Key: ' + data.secret_key + '</p>');
          popupWindow.document.write('</body></html>');
          popupWindow.document.close();
    
          // Butona tıklandığında OTP kodunu doğrulayın
          popupWindow.document.getElementById('verifyOtp').onclick = function() {
            let otpCode = popupWindow.document.getElementById('otpInput').value;
            // OTP kodunu sunucuya gönderin ve doğrulayın
            sendPostWithJwt('api/2fa/verify/', { token: otpCode })
            .then(verificationData => {
              if(verificationData.error) {
                popupWindow.alert('Verification failed: ' + verificationData.error);
              } else {
                popupWindow.alert('Verification is successful!' + verificationData.success);
                popupWindow.close(); // Doğrulama başarılıysa pencereyi kapat
              }
            })
            .catch(verificationError => {
              console.error('An error occurred during verification:', verificationError);
            });
          };
        }
      })
      .catch(error => {
        console.error('An error has occurred:', error);
      });
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
