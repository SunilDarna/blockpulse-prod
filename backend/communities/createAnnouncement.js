const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.TABLE_NAME;

/**
 * Lambda function to create a new announcement in a community
 */
exports.handler = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body);
    console.log('Request body:', requestBody);
    
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
    
    const { content, type = 'text', mediaUrl } = requestBody;
    
    // Validate required fields
    if (!content) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Missing required field: content' 
        })
      };
    }
    
    // Get user information from the event
    const userId = event.requestContext.authorizer.claims.sub;
    const userEmail = event.requestContext.authorizer.claims.email;
    const userName = event.requestContext.authorizer.claims.name || userEmail.split('@')[0];
    
    // Check if the user is a member of the community with admin role
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
    
    if (userMembership.Item.role !== 'admin') {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: 'Only community admins can create announcements' 
        })
      };
    }
    
    // Generate unique ID for the announcement
    const announcementId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Set expiration time (15 days from now)
    const expirationTime = Math.floor(Date.now() / 1000) + (15 * 24 * 60 * 60); // 15 days in seconds
    
    // Create announcement item
    const announcementItem = {
      PK: `COMMUNITY#${communityId}`,
      SK: `ANNOUNCEMENT#${announcementId}`,
      communityId,
      announcementId,
      content,
      type,
      mediaUrl: mediaUrl || null,
      createdAt: timestamp,
      createdBy: userName,
      createdById: userId,
      ttl: expirationTime, // TTL for 15-day retention
      reactions: {}
    };
    
    // Write to DynamoDB
    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: announcementItem
    }).promise();
    
    console.log('Announcement created successfully with ID:', announcementId);
    
    // Return success response
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Announcement created successfully',
        announcementId,
        content,
        type,
        mediaUrl: mediaUrl || null,
        createdAt: timestamp,
        createdBy: userName,
        reactions: {}
      })
    };
    
  } catch (error) {
    console.error('Error creating announcement:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message: 'Failed to create announcement',
        error: error.message
      })
    };
  }
};
