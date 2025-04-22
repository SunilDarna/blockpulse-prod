import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to resend confirmation code
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { username } = JSON.parse(event.body);

    // Validate required fields
    if (!username) {
      return errorResponse(400, 'Username is required');
    }

    // Resend confirmation code
    const resendParams = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username,
    };

    await cognito.resendConfirmationCode(resendParams).promise();

    return successResponse({
      message: 'Confirmation code resent successfully',
      username,
    });
  } catch (error: any) {
    console.error('Error resending confirmation code:', error);

    if (error.code === 'UserNotFoundException') {
      return errorResponse(404, 'User not found');
    }

    if (error.code === 'LimitExceededException') {
      return errorResponse(429, 'Too many requests, please try again later');
    }

    if (error.code === 'InvalidParameterException' && error.message.includes('already confirmed')) {
      return errorResponse(400, 'User is already confirmed');
    }

    return errorResponse(500, 'Error resending confirmation code');
  }
};
