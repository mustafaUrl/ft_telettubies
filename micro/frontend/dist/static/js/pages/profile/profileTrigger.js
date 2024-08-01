import  
{ addfriendListener,  listFriends, 
    pendingFriendRequests } from './profile_utils.js'
import accountListener from './account.js'
import historylistener from './matchHistory.js'


export default function profileTrigger(contentId) {

    if (contentId === 'friends') {
        addfriendListener();
        listFriends();
        pendingFriendRequests();
    }
    if (contentId === 'account') {
        console.log('account');
        accountListener();
    }
    if(contentId === 'matchHistory') {
        console.log('match history');
       historylistener();
    }
    
    
}