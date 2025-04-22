import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';
import { getItem } from '../utils/dynamodb';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';

/**
 * Lambda function to get user details
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

    // Get user information from Cognito
    const userInfo = await cognito.getUser({ AccessToken: accessToken }).promise();
    
    if (!userInfo || !userInfo.Username) {
      return errorResponse(404, 'User not found');
    }

    // Get user sub from attributes
    const userSub = userInfo.UserAttributes.find(attr => attr.Name === 'sub')?.Value;
    
    if (!userSub) {
      return errorResponse(500, 'User sub not found');
    }

    // Get additional user data from DynamoDB
    const userItem = await getItem({
      PK: `USER#${userSub}`,
      SK: `PROFILE#${userSub}`,
    });

    if (!userItem) {
      return errorResponse(404, 'User profile not found');
    }

    // Return user data
    return successResponse({
      user: {
        userId: userItem.userId,
        username: userItem.username,
        email: userItem.email,
        firstName: userItem.firstName,
        lastName: userItem.lastName,
        createdAt: userItem.createdAt,
        status: userItem.status,
      },
    });
  } catch (error: any) {
    console.error('Error getting user details:', error);

    if (error.code === 'NotAuthorizedException') {
      return errorResponse(401, 'Invalid or expired token');
    }

    return errorResponse(500, 'Error getting user details');
  }
};
