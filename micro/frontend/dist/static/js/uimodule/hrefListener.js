import  changeContent  from './changeContent.js';

export default function hrefListener() {

    const dynamicLinks = document.querySelectorAll('.dynamic-content');
    dynamicLinks.forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const contentId = this.id.replace('-link', '');
        changeContent(contentId);
        console.log('hrefListener.js ok', contentId);
      });
    });
  }

