import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDB, ApiGatewayManagementApi } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Get environment variables
const TABLE_NAME = process.env.TABLE_NAME || '';
const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME || '';

// Initialize DynamoDB client
const dynamoDB = new DynamoDB.DocumentClient();

/**
 * Lambda function to handle WebSocket sendMessage route
 * @param event API Gateway WebSocket event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('WebSocket sendMessage event:', JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;
  const domainName = event.requestContext.domainName;
  const stage = event.requestContext.stage;
  const timestamp = new Date().toISOString();

  // Initialize API Gateway Management API client
  const apiGateway = new ApiGatewayManagementApi({
    apiVersion: '2018-11-29',
    endpoint: `${domainName}/${stage}`,
  });

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

    const { userId, username } = connection;

    // Parse the message from the event body
    const body = JSON.parse(event.body || '{}');
    const { communityId, content } = body;

    if (!communityId || !content) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad request: Missing required fields' }),
      };
    }

    // Validate content length
    if (content.length > 1000) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Bad request: Message content too long (max 1000 characters)' }),
      };
    }

    // Sanitize content (basic sanitization, consider using a library like DOMPurify in production)
    const sanitizedContent = content
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Generate a unique message ID
    const messageId = uuidv4();

    // Store the message in DynamoDB
    const message = {
      PK: `COMMUNITY#${communityId}`,
      SK: `MESSAGE#${timestamp}#${messageId}`,
      messageId,
      communityId,
      userId,
      username,
      content: sanitizedContent,
      timestamp,
      type: 'MESSAGE',
      GSI1PK: `COMMUNITY#${communityId}`,
      GSI1SK: `MESSAGE#${timestamp}#${messageId}`,
      GSI2PK: `USER#${userId}`,
      GSI2SK: `MESSAGE#${timestamp}#${messageId}`,
    };

    await dynamoDB.put({
      TableName: TABLE_NAME,
      Item: message,
    }).promise();

    // Get all connections for the community
    const connectionsResponse = await dynamoDB.query({
      TableName: CONNECTIONS_TABLE_NAME,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :communityId',
      ExpressionAttributeValues: {
        ':communityId': `COMMUNITY#${communityId}`,
      },
    }).promise();

    const connections = connectionsResponse.Items || [];

    // Broadcast the message to all connected clients in the community
    const messagePayload = JSON.stringify({
      type: 'MESSAGE',
      data: {
        messageId,
        communityId,
        userId,
        username,
        content: sanitizedContent,
        timestamp,
      },
    });

    // Send the message to all connections
    const sendPromises = connections.map(async (connection) => {
      try {
        await apiGateway.postToConnection({
          ConnectionId: connection.connectionId,
          Data: messagePayload,
        }).promise();
      } catch (error) {
        // If the connection is no longer valid, remove it
        if ((error as any).statusCode === 410) {
          await dynamoDB.delete({
            TableName: CONNECTIONS_TABLE_NAME,
            Key: {
              connectionId: connection.connectionId,
            },
          }).promise();
        }
      }
    });

    await Promise.all(sendPromises);

    return {
      statusCode: 200,
      body: JSON.stringify({ messageId }),
    };
  } catch (error) {
    console.error('Error handling WebSocket message:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
