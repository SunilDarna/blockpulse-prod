import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

// Get environment variables
const TABLE_NAME = process.env.TABLE_NAME || '';
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME || '';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * Lambda function to handle WebSocket joinCommunity route
 * @param event API Gateway WebSocket event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket joinCommunity event:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    // Get the connection details from the connections table
    const connectionResponse = await dynamoDB.get({
      TableName: CONNECTIONS_TABLE_NAME,
      Key: {
        connectionId,
      },
    }).promise();

    const connection = connectionResponse.Item;

    if (!connection) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unauthorized: Connection not found' }),
      };
    }

    const { userId } = connection;

    // Parse the message from the event body
    const body = JSON.parse(event.body || '{}');
    const { communityId } = body;

    if (!communityId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad request: Missing communityId' }),
      };
    }

    // Check if the user is a member of the community
    const membershipResponse = await dynamoDB.get({
      TableName: TABLE_NAME,
      Key: {
        PK: `COMMUNITY#${communityId}`,
        SK: `MEMBER#${userId}`,
      },
    }).promise();

    if (!membershipResponse.Item) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: 'Forbidden: User is not a member of this community' }),
      };
    }

    // Update the connection with the community ID
    await dynamoDB.update({
      TableName: CONNECTIONS_TABLE_NAME,
      Key: {
        connectionId,
      },
      UpdateExpression: 'SET GSI1PK = :communityId',
      ExpressionAttributeValues: {
        ':communityId': `COMMUNITY#${communityId}`,
      },
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Joined community chat' }),
    };
  } catch (error) {
    console.error('Error handling WebSocket joinCommunity:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
