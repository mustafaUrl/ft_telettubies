function joinRoom(friendUsername) {
    if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'join',
        friend: friendUsername
      };
      chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket bağlantısı açık değil.');
    }
  }
  
  // Odayı terk etme komutunu gönder
  function leaveRoom(friendUsername) {
    if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'leave',
        friend: friendUsername
      };
      chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket bağlantısı açık değil.');
    }
  }
  
  // Mesaj gönderme komutunu gönder
  function sendMessage(text) {
    if (chatSocketPrivate && chatSocketPrivate.readyState === WebSocket.OPEN) {
      const message = {
        command: 'send',
        friend: otherUser,
        message: text
      };
      chatSocketPrivate.send(JSON.stringify(message));
    } else {
      console.error('WebSocket bağlantısı açık değil.');
    }
  }
  

  function closeSocket() {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
      chatSocket.close();
    }
  }

  export { closeSocket, sendMessage, joinRoom, leaveRoom };