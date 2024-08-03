import   {getCookie}  from '../cookies/cookies.js';


export default function checkAuthStatus() {
    const accessToken = getCookie('accessToken');
    const signInLink = document.getElementById('sign-in-link');
    const signUpLink = document.getElementById('sign-up-link');
    const profileLink = document.getElementById('profile-link');
    const logoutLink = document.getElementById('logout-link');
    const gameLink = document.getElementById('game-link');
    const chat_boxlink = document.getElementById('chat_box');
    const chat_icon = document.getElementById('chat_icon');
    if (accessToken) {
      // Kullanıcı oturum açmışsa, giriş ve kayıt linklerini gizle
      signInLink.style.display = 'none';
      signUpLink.style.display = 'none';
      // Profil ve çıkış butonlarını göster
      profileLink.style.display = 'block';
      logoutLink.style.display = 'block';
      chat_boxlink.style.display = 'block';
      gameLink.style.display = 'block';
      chat_icon.style.display = 'block';
    } else {
      // Kullanıcı oturum açmamışsa, profil ve çıkış butonlarını gizle
      profileLink.style.display = 'none';
      logoutLink.style.display = 'none';
      chat_boxlink.style.display = 'none';
      // Giriş ve kayıt linklerini göster
      signInLink.style.display = 'block';
      signUpLink.style.display = 'block';
      gameLink.style.display = 'none';
      chat_icon.style.display = 'none';
    }
  }
  