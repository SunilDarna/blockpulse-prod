import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { successResponse, errorResponse } from '../utils/response';
import { queryItems } from '../utils/dynamodb';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle user login
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { username, password } = JSON.parse(event.body);

    // Validate required fields
    if (!username || !password) {
      return errorResponse(400, 'Username and password are required');
    }

    // Determine if the username is an email or a username
    let cognitoUsername = username;
    
    // If it's not an email format, try to find the user by username
    if (!username.includes('@')) {
      const queryResult = await queryItems(
        'GSI1PK = :username',
        { ':username': `USER#${username}` },
        'GSI1'
      );

      if (!queryResult.Items || queryResult.Items.length === 0) {
        return errorResponse(404, 'User not found');
      }

      cognitoUsername = queryResult.Items[0].email;
    }

    // Authenticate user with Cognito
    const authParams = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: USER_POOL_CLIENT_ID,
      AuthParameters: {
        USERNAME: cognitoUsername,
        PASSWORD: password,
      },
    };

    const authResult = await cognito.initiateAuth(authParams).promise();

    if (!authResult.AuthenticationResult) {
      return errorResponse(401, 'Authentication failed');
    }

    // Get user details
    let userDetails;
    if (username.includes('@')) {
      // Find user by email
      const queryResult = await queryItems(
        'GSI2PK = :email',
        { ':email': `EMAIL#${username}` },
        'GSI2'
      );

      if (queryResult.Items && queryResult.Items.length > 0) {
        userDetails = queryResult.Items[0];
      }
    } else {
      // User details already fetched above
      const queryResult = await queryItems(
        'GSI1PK = :username',
        { ':username': `USER#${username}` },
        'GSI1'
      );

      if (queryResult.Items && queryResult.Items.length > 0) {
        userDetails = queryResult.Items[0];
      }
    }

    return successResponse({
      message: 'Login successful',
      tokens: {
        idToken: authResult.AuthenticationResult.IdToken,
        accessToken: authResult.AuthenticationResult.AccessToken,
        refreshToken: authResult.AuthenticationResult.RefreshToken,
        expiresIn: authResult.AuthenticationResult.ExpiresIn,
      },
      user: userDetails ? {
        userId: userDetails.userId,
        username: userDetails.username,
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
      } : null,
    });
  } catch (error: any) {
    console.error('Error logging in:', error);

    if (error.code === 'UserNotFoundException') {
      return errorResponse(404, 'User not found');
    }

    if (error.code === 'NotAuthorizedException') {
      return errorResponse(401, 'Incorrect username or password');
    }

    if (error.code === 'UserNotConfirmedException') {
      return errorResponse(403, 'User is not confirmed');
    }

    return errorResponse(500, 'Error logging in');
  }
};
