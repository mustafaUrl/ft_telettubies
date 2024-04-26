import  
{ addfriendListener,  listFriends, 
    pendingFriendRequests, accountListener } from './profile_utils.js'


export default function profileTrigger(contentId) {

    if (contentId === 'friends') {
        addfriendListener();
        listFriends();
        pendingFriendRequests();
      }
      if (contentId === 'account') {
        accountListener();
      }
    }