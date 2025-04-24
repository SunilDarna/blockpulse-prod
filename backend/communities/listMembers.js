const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to list members of a community
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
    
    // First, check if the user is a member of the community
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
    
    // Query for all members of the community
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `COMMUNITY#${communityId}`,
        ':sk': 'MEMBER#'
      }
    };
    
    const result = await dynamoDB.query(params).promise();
    
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
    
    // Format the response
    const members = result.Items.map(item => ({
      userId: item.userId,
      displayName: item.displayName,
      email: item.email,
      role: item.role,
      status: item.status,
      joinedAt: item.joinedAt
    }));
    
    const community = {
      communityId: communityResult.Item.communityId,
      name: communityResult.Item.name,
      description: communityResult.Item.description,
      joinType: communityResult.Item.joinType,
      tags: communityResult.Item.tags || [],
      createdAt: communityResult.Item.createdAt,
      createdBy: communityResult.Item.createdBy,
      memberCount: communityResult.Item.memberCount || members.length
    };
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        community,
        members,
        userRole: userMembership.Item.role
      })
    };
    
  } catch (error) {
    console.error('Error listing community members:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to list community members',
        error: error.message
      })
    };
  }
};
