async function changeContentProfile(contentId) {
  console.log('İçerik değiştiriliyor:', contentId);
  if (localStorage.getItem('contentData') === null) {
    fetch('api/content/')
      .then(response => response.json())
      .then(data => {
        localStorage.setItem('contentData', JSON.stringify(data));
      })
  .catch(error => console.error('Error:', error));
  var contentData = JSON.parse(localStorage.getItem('contentData'));
  }
  else {
    var contentData = JSON.parse(localStorage.getItem('contentData'));
  }
  if ( contentId !== 'logout' && contentData[contentId] === undefined) {
    console.log('Content not found');
    return;
  }
  if (contentId === 'logout') {
    logoutListener();
  }
  else{
    
    const htmlContent =contentData[contentId];
    document.getElementById('content-profile').innerHTML = htmlContent;
    history.pushState({ id: contentId, htmlContent: htmlContent, profileContent: true }, null, null);
    if (contentId === 'friends') {
      listFriends();
      pendingFriendRequests();
      addfriendListener();
    }
    else if (contentId === 'account') {
      accountListener();
    }

    triggerContentLoad(contentId);
  }
  checkAuthStatus();

}








// İçeriğin Yüklendiğini Belirten Özel Bir Olayı Tetikleyen Fonksiyon

 





  


