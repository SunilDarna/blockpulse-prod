import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle forgot password request
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

    // Initiate forgot password flow in Cognito
    const forgotPasswordParams = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username,
    };

    await cognito.forgotPassword(forgotPasswordParams).promise();

    return successResponse({
      message: 'Password reset code sent to your email',
      username,
    });
  } catch (error: any) {
    console.error('Error initiating forgot password:', error);

    if (error.code === 'UserNotFoundException') {
      // For security reasons, don't reveal that the user doesn't exist
      return successResponse({
        message: 'If your account exists, a password reset code has been sent to your email',
      });
    }

    if (error.code === 'LimitExceededException') {
      return errorResponse(429, 'Too many requests, please try again later');
    }

    return errorResponse(500, 'Error initiating password reset');
  }
};
