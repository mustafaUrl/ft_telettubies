//import { sendPostUserRequest } from './RequestHelper.js';

function joinRoom(friendUsername) {
    if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'join',
        friend: friendUsername
      };
      window.chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket connection is not open.');
    }
  }
  
  // Odayı terk etme komutunu gönder
  function leaveRoom(friendUsername) {
    if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'leave',
        friend: friendUsername
      };
      window.chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket connection is not open.');
    }
  }
  
  // Mesaj gönderme komutunu gönder
  function sendMessage(text) {
    if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'send',
        friend: window.otherUser,
        message: text
      };
      window.chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket connection is not open.');
    }
  }
  

  function closeSocket() {
    if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
      window.chatSocket.close();
    }
  }

  function checkBlocked(friendUsername) {

    /* return new Promise((resolve, reject) => {
      sendPostUserRequest('check_blocked', friendUsername)
        .then(data => {
          resolve(data);
        })
        .catch(error => {
          console.error('Processing error:', error);
          reject(error);
        });
    }
    ); */
  }

  export { closeSocket, sendMessage, joinRoom, leaveRoom, checkBlocked };