
import  sendPostWithJwt from '../../postwithjwt/sendPostWithJwt.js';

export default  function historylistener() {
   
        try {
          const url = 'api/user/get_match_history';
          const bodyData = {}; // Any required data for the POST request, if needed
          const method = 'GET'; // Use POST method as defined in the Django view
      
          const matchHistory = sendPostWithJwt(url, bodyData, method);
          console.log(matchHistory);
        } catch (error) {
          console.error('An error occurred while fetching match history:', error);
        }
      
   
}