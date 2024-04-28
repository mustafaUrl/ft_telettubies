function joinRoom(friendUsername) {
    if (window.chatSocketPrivate && window.chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'join',
        friend: friendUsername
      };
      window.chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket bağlantısı açık değil.');
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
      console.error('WebSocket bağlantısı açık değil.');
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
      console.error('WebSocket bağlantısı açık değil.');
    }
  }
  

  function closeSocket() {
    if (window.chatSocket && window.chatSocket.readyState === WebSocket.OPEN) {
      window.chatSocket.close();
    }
  }

  export { closeSocket, sendMessage, joinRoom, leaveRoom };