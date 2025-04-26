const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to get a community by ID
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
    
    // Get community details
    const communityParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `METADATA#${communityId}`
      }
    };
    
    const communityResult = await dynamoDB.get(communityParams).promise();
    
    if (!communityResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Community not found' 
        })
      };
    }
    
    // Check if the user is a member of the community
    const userMembershipParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `MEMBER#${userId}`
      }
    };
    
    const userMembership = await dynamoDB.get(userMembershipParams).promise();
    
    // Format the response
    const community = {
      communityId: communityResult.Item.communityId,
      name: communityResult.Item.name,
      description: communityResult.Item.description,
      joinType: communityResult.Item.joinType,
      tags: communityResult.Item.tags || [],
      createdAt: communityResult.Item.createdAt,
      createdBy: communityResult.Item.createdBy,
      memberCount: communityResult.Item.memberCount || 0,
      isMember: !!userMembership.Item,
      userRole: userMembership.Item?.role || null
    };
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(community)
    };
    
  } catch (error) {
    console.error('Error getting community:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to get community',
        error: error.message
      })
    };
  }
};
