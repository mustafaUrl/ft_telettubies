import  login  from '../pages/login/login.js';
import  logout  from '../pages/logout/logout.js';
import  register  from '../pages/register/register.js';
import  profile  from '../pages/profile/profile.js';
import  menu from '../pages/game/menu.js';
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
      case 'game':
        menu();
        break;
      case 'profile':
      case 'friends':
      case 'account':
      case 'matchHistory':
        profile();
        break;
      default:
        console.log('Content not found ss');
        break;
    }
    
}
