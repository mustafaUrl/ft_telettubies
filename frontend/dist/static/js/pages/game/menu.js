import lobby from './lobby.js';
export default function menu() {

    lobby();
    if (window.chatSocket) {
        window.chatSocket.send(JSON.stringify({
          'username': "test",
          'room': 'test',
          'command': 'online_players'
        }));
      }
}