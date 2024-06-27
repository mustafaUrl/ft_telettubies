import  login  from '../pages/login/login.js';
import  logout  from '../pages/logout/logout.js';
import  register  from '../pages/register/register.js';
import  pong from '../pages/pong/pong.js';
import  profile  from '../pages/profile/profile.js';
import  tournament  from '../pages/tournament/tournament.js';
import  game from '../pages/game/game.js';

export default function triggerContentLoad(contentId) {
   
    switch (contentId) {
      case 'sign-in':
        login();
        break;
      case 'logout':
        logout();
        break;
      case 'sign-up':
        register();
        break;
      case 'pong':
        pong();
        break;
      case 'game':
        game();
        break;
      case 'profile':
      case 'friends':
      case 'account':
        profile();
        break;
      case 'tournament':
        tournament();
        break;
      default:
        console.log('Content not found ss');
        break;
    }
    
}
