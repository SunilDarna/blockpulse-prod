import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';
const TABLE_NAME = process.env.TABLE_NAME || '';
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME || '';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();

// Initialize the JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access',
  clientId: USER_POOL_CLIENT_ID,
});

/**
 * Lambda function to handle WebSocket $connect route
 * @param event API Gateway WebSocket event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket $connect event:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;
  const timestamp = new Date().toISOString();

  try {
    // Get the token from the query string parameters
    const token = event.queryStringParameters?.token;

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized: Missing token' }),
      };
    }

    // Verify the JWT token
    const payload = await verifier.verify(token);

    // Extract user information from the token
    const userId = payload.sub;
    const username = payload['cognito:username'];

    // Store the connection in DynamoDB
    await dynamoDB.put({
      TableName: CONNECTIONS_TABLE_NAME,
      Item: {
        connectionId,
        userId,
        username,
        timestamp,
        ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hour TTL
      },
    }).promise();

    // Update user's connection status in the main table
    await dynamoDB.update({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: `PROFILE#${userId}`,
      },
      UpdateExpression: 'SET connectionId = :connectionId, lastSeen = :timestamp, isOnline = :isOnline',
      ExpressionAttributeValues: {
        ':connectionId': connectionId,
        ':timestamp': timestamp,
        ':isOnline': true,
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Connected' }),
    };
  } catch (error) {
    console.error('Error handling WebSocket connection:', error);
    
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Unauthorized: Invalid token' }),
    };
  }
};
