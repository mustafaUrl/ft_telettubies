import sendPostUserRequest from '../postwithjwt/userRequest.js';

export default async function get_banned_user(username) {
    try {
      const response = await sendPostUserRequest('get_banned');
  
      // Ensure response is in the expected format
      if (!response || !Array.isArray(response.blocked_users)) {
        throw new Error('Invalid response structure');
      }
  
      const bannedUsers = response.blocked_users;
  
      // Check if the specified username is in the list of banned users
      const isBanned = bannedUsers.some(user => user.username === username);
  
      return isBanned; // Return the result
  
    } catch (error) {
      console.error('Processing error:', error);
      return false; // Ensure a boolean value is returned
    }
  }
  