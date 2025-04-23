const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

/**
 * Lambda function to get a community by ID
 */
exports.handler = async (event) => {
  try {
    // Get community ID from path parameters
    const communityId = event.pathParameters.communityId;
    
    // Get user ID from the event
    const userId = event.requestContext.authorizer.claims.sub;
    
    if (!communityId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'Community ID is required' })
      };
    }
    
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
        },
        body: JSON.stringify({ message: 'Community not found' })
      };
    }
    
    // Check if the user is a member of this community
    const membershipParams = {
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `MEMBER#${userId}`
      }
    };
    
    const membershipResult = await dynamoDB.get(membershipParams).promise();
    
    // If community is not open and user is not a member, deny access
    if (communityResult.Item.joinType !== 'open' && !membershipResult.Item) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ message: 'You do not have access to this community' })
      };
    }
    
    // Get member count
    const membersParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `COMMUNITY#${communityId}`,
        ':sk': 'MEMBER#'
      },
      Select: 'COUNT'
    };
    
    const membersResult = await dynamoDB.query(membersParams).promise();
    
    // Prepare response
    const community = {
      communityId: communityResult.Item.communityId,
      name: communityResult.Item.name,
      description: communityResult.Item.description,
      joinType: communityResult.Item.joinType,
      tags: communityResult.Item.tags || [],
      createdAt: communityResult.Item.createdAt,
      updatedAt: communityResult.Item.updatedAt,
      memberCount: membersResult.Count,
      userRole: membershipResult.Item ? membershipResult.Item.role : null,
      userStatus: membershipResult.Item ? membershipResult.Item.status : null,
      isMember: !!membershipResult.Item
    };
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
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
      },
      body: JSON.stringify({ 
        message: 'Failed to get community',
        error: error.message
      })
    };
  }
};
