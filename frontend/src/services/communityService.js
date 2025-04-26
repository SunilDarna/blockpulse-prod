import { API, Auth } from 'aws-amplify';

/**
 * Service for community-related API calls
 */
export const communityService = {
  /**
   * Create a new community
   * @param {Object} communityData - The community data
   * @param {string} communityData.name - Community name
   * @param {string} communityData.description - Community description
   * @param {string} communityData.joinType - Join type ('open' or 'invite')
   * @param {Array<string>} communityData.tags - Array of tags
   * @returns {Promise<Object>} - The created community
   */
  createCommunity: async (communityData) => {
    try {
      console.log('Creating community with data:', communityData);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.post('communityApi', '/communities', {
        body: communityData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Community created successfully:', response);
      
      // Enhance the response with the full data needed for the UI
      const enhancedResponse = {
        ...response,
        description: communityData.description,
        tags: communityData.tags || [],
        memberCount: 1, // Creator is the first member
        userRole: 'admin' // Creator is always admin
      };
      
      return enhancedResponse;
    } catch (error) {
      console.error('Error creating community:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  /**
   * Get all communities for the current user
   * @returns {Promise<Array<Object>>} - List of communities
   */
  getUserCommunities: async () => {
    try {
      console.log('Fetching user communities from API...');
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.get('communityApi', '/communities/user', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('User communities API response:', response);
      
      // Ensure we always return an array
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching user communities:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  /**
   * Get community details by ID
   * @param {string} communityId - The community ID
   * @returns {Promise<Object>} - Community details
   */
  getCommunityById: async (communityId) => {
    try {
      console.log(`Fetching community details for ID: ${communityId}`);
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.get('communityApi', `/communities/${communityId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Community details fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  /**
   * Create a new announcement in a community
   * @param {string} communityId - The community ID
   * @param {Object} announcementData - The announcement data
   * @returns {Promise<Object>} - The created announcement
   */
  createAnnouncement: async (communityId, announcementData) => {
    try {
      console.log(`Creating announcement in community ${communityId}:`, announcementData);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.post('communityApi', `/communities/${communityId}/announcements`, {
        body: announcementData,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Announcement created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating announcement:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  /**
   * Get all announcements for a community
   * @param {string} communityId - The community ID
   * @returns {Promise<Array<Object>>} - List of announcements
   */
  getCommunityAnnouncements: async (communityId) => {
    try {
      console.log(`Fetching announcements for community ${communityId}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.get('communityApi', `/communities/${communityId}/announcements`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Announcements fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching announcements for community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  /**
   * Delete a community (admin only)
   * @param {string} communityId - The community ID
   * @returns {Promise<void>}
   */
  deleteCommunity: async (communityId) => {
    try {
      console.log(`Deleting community ${communityId}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      await API.del('communityApi', `/communities/${communityId}`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Community deleted successfully');
    } catch (error) {
      console.error(`Error deleting community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }
};

export default communityService;
