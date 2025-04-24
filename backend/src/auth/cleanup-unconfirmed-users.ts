import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { deleteItem, queryItems } from '../utils/dynamodb';

// Initialize Cognito client
const cognito = new CognitoIdentityServiceProvider();

// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';

/**
 * Lambda function to clean up unconfirmed users
 * This function runs on a schedule to remove users who haven't confirmed their registration
 * after a certain period of time (e.g., 24 hours)
 */
export const handler = async (): Promise<void> => {
  try {
    console.log('Starting cleanup of unconfirmed users');

    // Get all unconfirmed users from Cognito
    const listUsersParams = {
      UserPoolId: USER_POOL_ID,
      Filter: 'cognito:user_status = "UNCONFIRMED"',
    };

    const unconfirmedUsers = await cognito.listUsers(listUsersParams).promise();

    console.log(`Found ${unconfirmedUsers.Users?.length || 0} unconfirmed users`);

    // Process each unconfirmed user
    for (const user of unconfirmedUsers.Users || []) {
      const username = user.Username;
      const userCreateDate = user.UserCreateDate;
      
      if (!username || !userCreateDate) {
        continue;
      }

      // Check if the user has been unconfirmed for more than 24 hours
      const now = new Date();
      const createdAt = new Date(userCreateDate);
      const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCreation > 24) {
        console.log(`Deleting unconfirmed user ${username} (created ${hoursSinceCreation.toFixed(2)} hours ago)`);

        // Get the user's email from attributes
        const emailAttribute = user.Attributes?.find(attr => attr.Name === 'email');
        const email = emailAttribute?.Value;

        if (email) {
          // Find the user in DynamoDB by email
          const queryResult = await queryItems(
            'GSI2PK = :email',
            { ':email': `EMAIL#${email}` },
            'GSI2'
          );

          // Delete the user from DynamoDB if found
          if (queryResult.Items && queryResult.Items.length > 0) {
            const userItem = queryResult.Items[0];
            await deleteItem({ PK: userItem.PK, SK: userItem.SK });
            console.log(`Deleted user ${username} from DynamoDB`);
          }
        }

        // Delete the user from Cognito
        await cognito.adminDeleteUser({
          UserPoolId: USER_POOL_ID,
          Username: username,
        }).promise();

        console.log(`Deleted user ${username} from Cognito`);
      }
    }

    console.log('Cleanup of unconfirmed users completed successfully');
  } catch (error) {
    console.error('Error cleaning up unconfirmed users:', error);
    throw error;
  }
};
