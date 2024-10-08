import  {getCookie}  from '../cookies/cookies.js';
import get_banned_user from '../utils/getBanned.js';

window.chatSocketPrivate;
window.otherUser = '';


export default function openSocketPrivate() {
  if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
    return;
  }
  window.chatSocketPrivate = new WebSocket(`wss://${window.location.host}/ws/chatPrivate/?token=` + getCookie('accessToken'));

 
  window.chatSocketPrivate.onopen = function(e) {
    console.log('WebSocket connection has been opened:', e);
  };

  window.chatSocketPrivate.onerror = function(e) {
    console.error('WebSocket error:', e);
  };

  window.unreadCount = 0; // Counter for unread messages

  window.chatSocketPrivate.onmessage = async function(e) {
    // Handle incoming messages
    const data = JSON.parse(e.data);
    
    const banned = await get_banned_user(data.username);
    if (banned) {
      return;
    }
    // Create a new div for the message
    const chatMessages = document.getElementById('chat_messages2');
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.username + ': ' + data.message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Increase unread count and update the chat label
    if (window.activeTab !== 'tab2') {
      window.unreadCount++;
      const unreadCountElement = document.getElementById('unread_count');
      unreadCountElement.textContent = `(${unreadCount})`;
      unreadCountElement.style.display = 'inline'; // Show count
    }
  };
  
}
