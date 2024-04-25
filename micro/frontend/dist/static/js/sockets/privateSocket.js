import  {getCookie}  from '../cookies/cookies.js';
import { addMessageToCookie, updateNotificationButton, showTab2WithUsername } from '../uimodule/chatBox.js';

let chatSocketPrivate;
let otherUser = '';

// WebSocket bağlantısını aç

export default function openSocketPrivate() {
  if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
    return;
  }
  chatSocketPrivate = new WebSocket(`wss://${window.location.host}/ws/chatPrivate/?token=` + getCookie('accessToken'));

  chatSocketPrivate.onopen = function(e) {
    console.log('WebSocket bağlantısı açıldı:', e);
  };

  chatSocketPrivate.onerror = function(e) {
    console.error('WebSocket hatası:', e);
  };

  chatSocketPrivate.onmessage = function(e) {
    // Gelen mesajları işle
    const data = JSON.parse(e.data);
    // Mesajları cookie'de sakla
    addMessageToCookie(data.username, data.message);
    if (data.username !== getCookie('username') && data.username !== otherUser) {
      updateNotificationButton(data.username);
      return;
    }

    // Mesajın hangi odaya ait olduğunu kontrol et
    const chatMessages = document.getElementById('chat_messages2');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    if (data.username !== getCookie('username')) {
      showTab2WithUsername(data.username); // Sekme 2'yi göster ve kullanıcı adını güncelle
    }
  };

  chatSocketPrivate.onclose = function(e) {
    console.error('WebSocket bağlantısı kapandı:', e);
  };
}
