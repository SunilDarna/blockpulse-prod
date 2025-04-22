import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';

/**
 * Lambda function to handle user logout
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Get the access token from the Authorization header
    const authHeader = event.headers.Authorization || event.headers.authorization;
    
    if (!authHeader) {
      return errorResponse(401, 'Missing authorization header');
    }
    
    // Extract the token (remove "Bearer " prefix if present)
    const accessToken = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    // Sign out the user in Cognito
    const signOutParams = {
      AccessToken: accessToken,
    };

    await cognito.globalSignOut(signOutParams).promise();

    return successResponse({
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Error logging out:', error);

    if (error.code === 'NotAuthorizedException') {
      return errorResponse(401, 'Invalid or expired token');
    }

    return errorResponse(500, 'Error logging out');
  }
};
