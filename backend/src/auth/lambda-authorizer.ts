import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import { CognitoJwtVerifier } from 'aws-jwt-verify';

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

// Initialize the JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: USER_POOL_ID,
  tokenUse: 'access',
  clientId: USER_POOL_CLIENT_ID,
});

/**
 * Lambda function to authorize API requests
 * @param event API Gateway authorizer event
 * @returns API Gateway authorizer result
 */
export const handler = async (event: APIGatewayTokenAuthorizerEvent): Promise<APIGatewayAuthorizerResult> => {
  try {
    // Get the token from the Authorization header
    const token = event.authorizationToken;
    
    if (!token) {
      throw new Error('Unauthorized');
    }

    // Remove 'Bearer ' prefix if present
    const accessToken = token.startsWith('Bearer ') ? token.substring(7) : token;

    // Verify the JWT token
    const payload = await verifier.verify(accessToken);

    // Extract user information from the token
    const userId = payload.sub;
    const username = payload['cognito:username'];

    // Generate policy document
    return generatePolicy(userId, 'Allow', event.methodArn, {
      userId,
      username,
    });
  } catch (error) {
    console.error('Error authorizing request:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

/**
 * Helper function to generate an IAM policy
 * @param principalId The principal ID (user ID)
 * @param effect The effect (Allow/Deny)
 * @param resource The resource ARN
 * @param context Additional context (optional)
 * @returns The policy document
 */
const generatePolicy = (
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context?: any
): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  // Add context if provided
  if (context) {
    authResponse.context = context;
  }

  return authResponse;
};
