const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE;

/**
 * Lambda function to list communities for a user
 */
exports.handler = async (event) => {
  try {
    // Get user ID from the event
    const userId = event.requestContext.authorizer.claims.sub;
    
    // Query for communities the user is a member of
    const userCommunitiesParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'COMMUNITY#'
      }
    };
    
    const userCommunitiesResult = await dynamoDB.query(userCommunitiesParams).promise();
    
    // If no communities found, return empty array
    if (!userCommunitiesResult.Items || userCommunitiesResult.Items.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify([])
      };
    }
    
    // Extract community IDs
    const communityIds = userCommunitiesResult.Items.map(item => item.communityId);
    
    // Get community details for each community ID
    const communityPromises = communityIds.map(async (communityId) => {
      const params = {
        TableName: TABLE_NAME,
        Key: {
          PK: `COMMUNITY#${communityId}`,
          SK: `METADATA#${communityId}`
        }
      };
      
      const result = await dynamoDB.get(params).promise();
      
      if (result.Item) {
        // Find the user's role in this community
        const userCommunity = userCommunitiesResult.Items.find(
          item => item.communityId === communityId
        );
        
        return {
          communityId: result.Item.communityId,
          name: result.Item.name,
          description: result.Item.description,
          joinType: result.Item.joinType,
          tags: result.Item.tags,
          memberCount: result.Item.memberCount,
          createdAt: result.Item.createdAt,
          role: userCommunity ? userCommunity.role : 'member',
          status: userCommunity ? userCommunity.status : 'active'
        };
      }
      
      return null;
    });
    
    const communities = (await Promise.all(communityPromises)).filter(Boolean);
    
    // Return the list of communities
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(communities)
    };
    
  } catch (error) {
    console.error('Error listing communities:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify({ 
        message: 'Failed to list communities',
        error: error.message
      })
    };
  }
};
