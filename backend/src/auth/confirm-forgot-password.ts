import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle confirm forgot password request
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { username, confirmationCode, newPassword } = JSON.parse(event.body);

    // Validate required fields
    if (!username || !confirmationCode || !newPassword) {
      return errorResponse(400, 'Username, confirmation code, and new password are required');
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return errorResponse(400, 'Password must be at least 8 characters long');
    }

    // Confirm forgot password in Cognito
    const confirmForgotPasswordParams = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    };

    await cognito.confirmForgotPassword(confirmForgotPasswordParams).promise();

    return successResponse({
      message: 'Password reset successful',
      username,
    });
  } catch (error: any) {
    console.error('Error confirming forgot password:', error);

    if (error.code === 'CodeMismatchException') {
      return errorResponse(400, 'Invalid confirmation code');
    }

    if (error.code === 'ExpiredCodeException') {
      return errorResponse(400, 'Confirmation code has expired');
    }

    if (error.code === 'UserNotFoundException') {
      return errorResponse(404, 'User not found');
    }

    if (error.code === 'InvalidPasswordException') {
      return errorResponse(400, 'Password does not meet complexity requirements');
    }

    return errorResponse(500, 'Error resetting password');
  }
};
