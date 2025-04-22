import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

// Get environment variables
const TABLE_NAME = process.env.TABLE_NAME || '';
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME || '';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * Lambda function to handle WebSocket $disconnect route
 * @param event API Gateway WebSocket event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket $disconnect event:', JSON.stringify(event, null, 2));

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

    if (connection) {
      const { userId } = connection;

      // Update user's connection status in the main table
      await dynamoDB.update({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: `PROFILE#${userId}`,
        },
        UpdateExpression: 'SET lastSeen = :timestamp, isOnline = :isOnline REMOVE connectionId',
        ExpressionAttributeValues: {
          ':timestamp': new Date().toISOString(),
          ':isOnline': false,
        },
      }).promise();

      // Remove the connection from the connections table
      await dynamoDB.delete({
        TableName: CONNECTIONS_TABLE_NAME,
        Key: {
          connectionId,
        },
      }).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Disconnected' }),
    };
  } catch (error) {
    console.error('Error handling WebSocket disconnection:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
