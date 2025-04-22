import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';
import { queryItems, updateItem } from '../utils/dynamodb';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle user registration confirmation
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { username, confirmationCode } = JSON.parse(event.body);

    // Validate required fields
    if (!username || !confirmationCode) {
      return errorResponse(400, 'Username and confirmation code are required');
    }

    // Confirm registration in Cognito
    const confirmSignUpParams = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username,
      ConfirmationCode: confirmationCode,
    };

    await cognito.confirmSignUp(confirmSignUpParams).promise();

    // Update user status in DynamoDB
    // First, find the user by email
    const queryResult = await queryItems(
      'GSI2PK = :email',
      { ':email': `EMAIL#${username}` },
      'GSI2'
    );

    if (!queryResult.Items || queryResult.Items.length === 0) {
      return errorResponse(404, 'User not found');
    }

    const user = queryResult.Items[0];
    
    // Update the user status to CONFIRMED
    await updateItem(
      { PK: user.PK, SK: user.SK },
      'SET #status = :status, #updatedAt = :updatedAt',
      {
        ':status': 'CONFIRMED',
        ':updatedAt': new Date().toISOString(),
      }
    );

    return successResponse({
      message: 'User registration confirmed successfully',
      username: user.username,
    });
  } catch (error: any) {
    console.error('Error confirming registration:', error);

    if (error.code === 'CodeMismatchException') {
      return errorResponse(400, 'Invalid confirmation code');
    }

    if (error.code === 'ExpiredCodeException') {
      return errorResponse(400, 'Confirmation code has expired');
    }

    if (error.code === 'UserNotFoundException') {
      return errorResponse(404, 'User not found');
    }

    return errorResponse(500, 'Error confirming registration');
  }
};
