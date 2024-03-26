// UI Modülü
const UIModule = (function() {
    // Özel DOM referansları
    const _signInLink = document.getElementById('sign-in-link');
    const _signUpLink = document.getElementById('sign-up-link');
    const _profileLink = document.getElementById('profile-link');
    const _logoutButton = document.querySelector('button[onclick="logout()"]');
  
    // Özel fonksiyonlar
    function _showElement(element) {
      element.style.display = 'block';
    }
  
    function _hideElement(element) {
      element.style.display = 'none';
    }
  
    // Açık API
    return {
      showSignInAndSignUp: function() {
        _showElement(_signInLink);
        _showElement(_signUpLink);
      },
      hideSignInAndSignUp: function() {
        _hideElement(_signInLink);
        _hideElement(_signUpLink);
      },
      showProfileAndLogout: function() {
        _showElement(_profileLink);
        _showElement(_logoutButton);
      },
      hideProfileAndLogout: function() {
        _hideElement(_profileLink);
        _hideElement(_logoutButton);
      }
    };
  })();
  
  // Kullanımı
  UIModule.hideProfileAndLogout(); // Profil ve çıkış butonlarını gizler
  UIModule.showSignInAndSignUp(); // Giriş ve kayıt linklerini gösterir
  