const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to get all announcements for a community
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Get community ID from path parameters
    const communityId = event.pathParameters?.communityId;
    
    if (!communityId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Missing required parameter: communityId' 
        })
      };
    }
    
    // Get user information from the event
    const userId = event.requestContext.authorizer.claims.sub;
    
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
    
    // Query for all announcements in the community
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `COMMUNITY#${communityId}`,
        ':sk': 'ANNOUNCEMENT#'
      },
      ScanIndexForward: false // Get newest first
    };
    
    const result = await dynamoDB.query(params).promise();
    
    // Format the response
    const announcements = result.Items.map(item => ({
      announcementId: item.announcementId,
      content: item.content,
      type: item.type,
      mediaUrl: item.mediaUrl,
      createdAt: item.createdAt,
      createdBy: item.createdBy,
      reactions: item.reactions || {}
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(announcements)
    };
    
  } catch (error) {
    console.error('Error getting announcements:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to get announcements',
        error: error.message
      })
    };
  }
};
