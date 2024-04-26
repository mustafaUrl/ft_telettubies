import  {getCookie}  from '../cookies/cookies.js';


window.chatSocket = '';
// let activeTab = 'tab1';

export default function openSocket() {
  if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
    return;
  }

  window.chatSocket = new WebSocket(`wss://${window.location.host}/ws/chat/?token=` + getCookie('accessToken'));
 
  window.chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    console.log('type:', data.type , 'data:', data);

    // Mesajın hangi odaya ait olduğunu kontrol et
    const chatMessages = document.getElementById('chat_messages1');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
  };

  window.chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
  };
}