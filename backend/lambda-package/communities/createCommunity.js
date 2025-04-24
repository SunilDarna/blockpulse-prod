const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to create a new community
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    console.log('Request body:', requestBody);
    
    const { name, description, joinType, tags } = requestBody;
    
    // Get user information from the event
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    const userName = event.requestContext.authorizer.claims.name || userEmail.split('@')[0];
    
    console.log('User info:', { userId, userEmail, userName });
    
    // Validate required fields
    if (!name || !description || !joinType) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: JSON.stringify({ 
          message: 'Missing required fields: name, description, and joinType are required' 
        })
      };
    }
    
    // Generate unique IDs
    const communityId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Create community item
    const communityItem = {
      PK: `COMMUNITY#${communityId}`,
      SK: `METADATA#${communityId}`,
      communityId,
      name,
      description,
      joinType: joinType || 'open', // Default to open if not specified
      tags: tags || [],
      createdAt: timestamp,
      updatedAt: timestamp,
      createdBy: userId,
      memberCount: 1, // Creator is the first member
      type: 'community'
    };
    
    // Create membership item for the creator (as admin)
    const membershipItem = {
      PK: `COMMUNITY#${communityId}`,
      SK: `MEMBER#${userId}`,
      communityId,
      userId,
      role: 'admin', // Creator is automatically an admin
      status: 'active',
      joinedAt: timestamp,
      email: userEmail,
      displayName: userName,
      type: 'membership'
    };
    
    // Create user's community reference
    const userCommunityItem = {
      PK: `USER#${userId}`,
      SK: `COMMUNITY#${communityId}`,
      communityId,
      userId,
      role: 'admin',
      status: 'active',
      joinedAt: timestamp,
      communityName: name,
      type: 'user_community'
    };
    
    console.log('Items to write:', {
      communityItem,
      membershipItem,
      userCommunityItem
    });
    
    // Write all items to DynamoDB in a transaction
    await dynamoDB.transactWrite({
      TransactItems: [
        { Put: { TableName: TABLE_NAME, Item: communityItem } },
        { Put: { TableName: TABLE_NAME, Item: membershipItem } },
        { Put: { TableName: TABLE_NAME, Item: userCommunityItem } }
      ]
    }).promise();
    
    console.log('Community created successfully with ID:', communityId);
    
    // Return success response
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Community created successfully',
        communityId,
        name,
        joinType,
        createdAt: timestamp
      })
    };
    
  } catch (error) {
    console.error('Error creating community:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to create community',
        error: error.message
      })
    };
  }
};
