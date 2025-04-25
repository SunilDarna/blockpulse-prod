const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME || 'BlockPulse-prod-Table';

/**
 * Lambda function to get all communities for a user
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Get user information from the event
    const userId = event.requestContext.authorizer.claims.sub;
    console.log('Processing request for user:', userId);
    
    // Query for all communities the user is a member of
    const params = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'COMMUNITY#'
      }
    };
    
    console.log('DynamoDB query params:', JSON.stringify(params, null, 2));
    const result = await dynamoDB.query(params).promise();
    console.log('DynamoDB query result:', JSON.stringify(result, null, 2));
    
    // If no communities found, return empty array
    if (!result.Items || result.Items.length === 0) {
      console.log('No communities found for user');
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([])
      };
    }
    
    // Get detailed information for each community
    const communityPromises = result.Items.map(async (item) => {
      const communityParams = {
        TableName: TABLE_NAME,
        Key: {
          PK: `COMMUNITY#${item.communityId}`,
          SK: `METADATA#${item.communityId}`
        }
      };
      
      console.log('Fetching community details:', JSON.stringify(communityParams, null, 2));
      const communityResult = await dynamoDB.get(communityParams).promise();
      console.log('Community details result:', JSON.stringify(communityResult, null, 2));
      
      if (communityResult.Item) {
        return {
          communityId: communityResult.Item.communityId,
          name: communityResult.Item.name,
          description: communityResult.Item.description,
          joinType: communityResult.Item.joinType,
          tags: communityResult.Item.tags || [],
          createdAt: communityResult.Item.createdAt,
          memberCount: communityResult.Item.memberCount || 0,
          userRole: item.role,
          status: item.status
        };
      }
      
      return null;
    });
    
    const communities = (await Promise.all(communityPromises)).filter(Boolean);
    console.log('Returning communities:', JSON.stringify(communities, null, 2));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(communities)
    };
    
  } catch (error) {
    console.error('Error getting user communities:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to get user communities',
        error: error.message
      })
    };
  }
};
