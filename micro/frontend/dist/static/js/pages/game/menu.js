import game from './game.js';
import lobby from './lobby.js';
import game4 from './game4.js';
export default function menu() {

    lobby();
    // game();
    // game4();
   
    if (window.chatSocket) {
        window.chatSocket.send(JSON.stringify({
          'username': "test",
          'room': 'test',
          'command': 'online_players'
        }));
      }
}