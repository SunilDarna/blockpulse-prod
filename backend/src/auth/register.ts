import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../utils/response';
import { putItem } from '../utils/dynamodb';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

/**
 * Lambda function to handle user registration
 * @param event API Gateway event
 * @returns API Gateway response
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    if (!event.body) {
      return errorResponse(400, 'Missing request body');
    }

    const { firstName, lastName, email, password, confirmPassword } = JSON.parse(event.body);

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return errorResponse(400, 'All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(400, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      return errorResponse(400, 'Password must be at least 8 characters long');
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      return errorResponse(400, 'Passwords do not match');
    }

    // Generate a unique username (combination of name and random string)
    const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${uuidv4().substring(0, 8)}`;

    // Register user in Cognito
    const signUpParams = {
      ClientId: USER_POOL_CLIENT_ID,
      Username: username, // Use generated username instead of email
      Password: password,
      UserAttributes: [
        {
          Name: 'given_name',
          Value: firstName,
        },
        {
          Name: 'family_name',
          Value: lastName,
        },
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'preferred_username',
          Value: username,
        },
      ],
    };

    const signUpResult = await cognito.signUp(signUpParams).promise();

    // Store additional user data in DynamoDB
    const timestamp = new Date().toISOString();
    const userItem = {
      PK: `USER#${signUpResult.UserSub}`,
      SK: `PROFILE#${signUpResult.UserSub}`,
      GSI1PK: `USER#${username}`,
      GSI1SK: `USER#${username}`,
      GSI2PK: `EMAIL#${email}`,
      GSI2SK: `USER#${signUpResult.UserSub}`,
      userId: signUpResult.UserSub,
      username,
      email,
      firstName,
      lastName,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: 'UNCONFIRMED',
      type: 'USER',
    };

    await putItem(userItem);

    return successResponse({
      message: 'User registration successful. Please check your email for verification code.',
      username: username, // Return the generated username instead of email
      userSub: signUpResult.UserSub,
    });
  } catch (error: any) {
    console.error('Error registering user:', error);

    if (error.code === 'UsernameExistsException') {
      return errorResponse(409, 'An account with this email already exists');
    }

    if (error.code === 'InvalidPasswordException') {
      return errorResponse(400, 'Password does not meet complexity requirements');
    }

    return errorResponse(500, 'Error registering user');
  }
};
