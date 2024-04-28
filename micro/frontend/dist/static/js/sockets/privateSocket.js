import  {getCookie}  from '../cookies/cookies.js';
// import {  showTab2WithUsername } from '../uimodule/chatBox.js';

window.chatSocketPrivate;
window.otherUser = '';

// WebSocket bağlantısını aç

export default function openSocketPrivate() {
  if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
    return;
  }
  window.chatSocketPrivate = new WebSocket(`wss://${window.location.host}/ws/chatPrivate/?token=` + getCookie('accessToken'));

  window.chatSocketPrivate.onopen = function(e) {
    // console.log('WebSocket bağlantısı açıldı:', e);
  };

  window.chatSocketPrivate.onerror = function(e) {
    console.error('WebSocket hatası:', e);
  };

  window.chatSocketPrivate.onmessage = function(e) {
    // Gelen mesajları işle
    const data = JSON.parse(e.data);
    // Mesajları cookie'de sakla

    // Mesajın hangi odaya ait olduğunu kontrol et
    const chatMessages = document.getElementById('chat_messages2');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    // if (data.username !== getCookie('username')) {
    //   showTab2WithUsername(data.username); // Sekme 2'yi göster ve kullanıcı adını güncelle
    // }
  };

  window.chatSocketPrivate.onclose = function(e) {
    console.error('WebSocket bağlantısı kapandı:', e);
  };
}
