import logout from '../pages/logout/logout.js';
import triggerContentLoad from '../gatePage/gatePage.js';
import checkAuthStatus from './checkAuthStatus.js';



export default async function changeContent(contentId) {
    let contentData = JSON.parse(localStorage.getItem('contentData'));
    
    if (contentData === null) {
      try {
        const response = await fetch('/api/content/');
        contentData = await response.json();
        localStorage.setItem('contentData', JSON.stringify(contentData));
      } catch (error) {
        console.error('Error:', error);
        return; // Hata durumunda fonksiyondan çık
      }
    }
    
    
    if (contentId !== 'logout' && contentData[contentId] === undefined) {
      console.log('Content not found');
      return;
    }
    
    if (contentId === 'logout') {
        logout();
    } else {
      const htmlContent = contentData[contentId];
      if (htmlContent) {
        document.getElementById('main-content').innerHTML = htmlContent;
        history.pushState({ id: contentId, htmlContent: htmlContent }, null, null);
        triggerContentLoad(contentId);
      } else {
        console.log('Content could not be found:', contentId);
      }
    }
    

    checkAuthStatus();
   
  }
