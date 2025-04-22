import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle token refresh
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { refreshToken } = JSON.parse(event.body);

    // Validate required fields
    if (!refreshToken) {
      return errorResponse(400, 'Refresh token is required');
    }

    // Refresh tokens in Cognito
    const refreshParams = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    };

    const refreshResult = await cognito.initiateAuth(refreshParams).promise();

    if (!refreshResult.AuthenticationResult) {
      return errorResponse(401, 'Token refresh failed');
    }

    return successResponse({
      message: 'Token refresh successful',
      tokens: {
        idToken: refreshResult.AuthenticationResult.IdToken,
        accessToken: refreshResult.AuthenticationResult.AccessToken,
        expiresIn: refreshResult.AuthenticationResult.ExpiresIn,
      },
    });
  } catch (error: any) {
    console.error('Error refreshing token:', error);

    if (error.code === 'NotAuthorizedException') {
      return errorResponse(401, 'Invalid refresh token');
    }

    return errorResponse(500, 'Error refreshing token');
  }
};
