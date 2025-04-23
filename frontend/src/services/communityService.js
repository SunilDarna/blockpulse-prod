import { API } from 'aws-amplify';

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
      const response = await API.post('communityApi', '/communities', {
        body: communityData,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Community created successfully:', response);
      return response;
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
      const response = await API.get('communityApi', '/communities/user');
      return response;
    } catch (error) {
      console.error('Error fetching user communities:', error);
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
      const response = await API.get('communityApi', `/communities/${communityId}`);
      return response;
    } catch (error) {
      console.error(`Error fetching community ${communityId}:`, error);
      throw error;
    }
  }
};

export default communityService;
