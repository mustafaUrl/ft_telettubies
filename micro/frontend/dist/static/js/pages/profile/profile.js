import  
{ addfriendListener,  listFriends, 
    pendingFriendRequests, accountListener } from '../profile/profile_utils.js'



export default function profile() {
    addfriendListener();
    listFriends();
    pendingFriendRequests();
    accountListener();

    }