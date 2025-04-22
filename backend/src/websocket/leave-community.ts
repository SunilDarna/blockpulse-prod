import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';

// Get environment variables
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME || '';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * Lambda function to handle WebSocket leaveCommunity route
 * @param event API Gateway WebSocket event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket leaveCommunity event:', JSON.stringify(event, null, 2));

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

    // Remove the community ID from the connection
    await dynamoDB.update({
      TableName: CONNECTIONS_TABLE_NAME,
      Key: {
        connectionId,
      },
      UpdateExpression: 'REMOVE GSI1PK',
    }).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Left community chat' }),
    };
  } catch (error) {
    console.error('Error handling WebSocket leaveCommunity:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
