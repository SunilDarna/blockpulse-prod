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
      
      // Add error handling and retry logic
      let retries = 3;
      let response;
      
      while (retries > 0) {
        try {
          response = await API.post('communityApi', '/communities', {
            body: communityData,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          });
          break; // Success, exit the retry loop
        } catch (err) {
          retries--;
          if (retries === 0) throw err; // No more retries, rethrow
          console.log(`API call failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
      
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
      
      // Ensure we always return an array with complete data
      if (Array.isArray(response)) {
        // Make sure each community has the required fields
        return response.map(community => ({
          ...community,
          // Ensure these fields exist with defaults if missing
          description: community.description || '',
          tags: community.tags || [],
          memberCount: community.memberCount || 1,
          userRole: community.userRole || 'member'
        }));
      }
      return [];
    } catch (error) {
      console.error('Error fetching user communities:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Return empty array instead of throwing to prevent UI crashes
      return [];
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
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
  
  /**
   * Join a community
   * @param {string} communityId - The community ID
   * @returns {Promise<Object>} - Join response
   */
  joinCommunity: async (communityId) => {
    try {
      console.log(`Joining community ${communityId}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.post('communityApi', `/communities/${communityId}/join`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Community joined successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error joining community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  /**
   * Get pending members for a community (admin only)
   * @param {string} communityId - The community ID
   * @returns {Promise<Array<Object>>} - List of pending members
   */
  getPendingMembers: async (communityId) => {
    try {
      console.log(`Fetching pending members for community ${communityId}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.get('communityApi', `/communities/${communityId}/members/pending`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Pending members fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching pending members for community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  },
  
  /**
   * Approve a pending member (admin only)
   * @param {string} communityId - The community ID
   * @param {string} userId - The user ID to approve
   * @returns {Promise<Object>} - Approval response
   */
  approveMember: async (communityId, userId) => {
    try {
      console.log(`Approving member ${userId} for community ${communityId}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.post('communityApi', `/communities/${communityId}/members`, {
        body: { userId, action: 'approve' },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Member approved successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error approving member ${userId} for community ${communityId}:`, error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },
  
  /**
   * Update a member's role (admin only)
   * @param {string} communityId - The community ID
   * @param {string} userId - The user ID to update
   * @param {string} role - The new role ('admin' or 'member')
   * @returns {Promise<Object>} - Update response
   */
  updateMemberRole: async (communityId, userId, role) => {
    try {
      console.log(`Updating role for member ${userId} in community ${communityId} to ${role}`);
      
      // Get the current user's JWT token
      const session = await Auth.currentSession();
      const idToken = session.getIdToken().getJwtToken();
      
      const response = await API.put('communityApi', `/communities/${communityId}/members/role`, {
        body: { userId, role },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      console.log('Member role updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating role for member ${userId} in community ${communityId}:`, error);
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
