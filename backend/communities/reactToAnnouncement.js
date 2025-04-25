const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to add or remove a reaction to an announcement
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    console.log('Request body:', requestBody);
    
    // Get community ID and announcement ID from path parameters
    const communityId = event.pathParameters?.communityId;
    const announcementId = event.pathParameters?.announcementId;
    
    if (!communityId || !announcementId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Missing required parameters: communityId and announcementId' 
        })
      };
    }
    
    const { reactionType, action } = requestBody;
    
    // Validate required fields
    if (!reactionType || !action) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Missing required fields: reactionType and action' 
        })
      };
    }
    
    if (action !== 'add' && action !== 'remove') {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Invalid action: must be "add" or "remove"' 
        })
      };
    }
    
    // Get user information from the event
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    const userName = event.requestContext.authorizer.claims.name || userEmail.split('@')[0];
    
    // Check if the user is a member of the community
    const userMembershipParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `MEMBER#${userId}`
      }
    };
    
    const userMembership = await dynamoDB.get(userMembershipParams).promise();
    
    if (!userMembership.Item) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'You are not a member of this community' 
        })
      };
    }
    
    // Get the announcement
    const announcementParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `ANNOUNCEMENT#${announcementId}`
      }
    };
    
    const announcementResult = await dynamoDB.get(announcementParams).promise();
    
    if (!announcementResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Announcement not found' 
        })
      };
    }
    
    // Initialize reactions object if it doesn't exist
    const reactions = announcementResult.Item.reactions || {};
    
    // Initialize reaction type array if it doesn't exist
    if (!reactions[reactionType]) {
      reactions[reactionType] = [];
    }
    
    if (action === 'add') {
      // Add reaction if not already added
      if (!reactions[reactionType].includes(userId)) {
        reactions[reactionType].push(userId);
      }
    } else {
      // Remove reaction if it exists
      reactions[reactionType] = reactions[reactionType].filter(id => id !== userId);
      
      // Remove empty reaction type arrays
      if (reactions[reactionType].length === 0) {
        delete reactions[reactionType];
      }
    }
    
    // Update the announcement with the new reactions
    const updateParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `ANNOUNCEMENT#${announcementId}`
      },
      UpdateExpression: 'set reactions = :reactions',
      ExpressionAttributeValues: {
        ':reactions': reactions
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const updateResult = await dynamoDB.update(updateParams).promise();
    
    // Format the response
    const updatedAnnouncement = {
      announcementId,
      reactions: updateResult.Attributes.reactions || {}
    };
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedAnnouncement)
    };
    
  } catch (error) {
    console.error('Error updating announcement reaction:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to update announcement reaction',
        error: error.message
      })
    };
  }
};
