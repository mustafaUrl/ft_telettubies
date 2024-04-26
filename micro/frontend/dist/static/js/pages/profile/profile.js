import  changeContent  from '../../uimodule/changeContent.js';
import profileTrigger  from './profileTrigger.js'

export default function profile() {
  

        const dynamicLinks = document.querySelectorAll('.dynamic-profile');
        dynamicLinks.forEach(link => {
          link.addEventListener('click', function(event) {
            event.preventDefault();
            const contentId = this.id.replace('-link', '');
            changeContent(contentId);
            profileTrigger(contentId);
          });
        });
    
    }