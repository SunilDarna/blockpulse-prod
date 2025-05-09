"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const response_1 = require("../utils/response");
const dynamodb_1 = require("../utils/dynamodb");
// Initialize Cognito client
const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';
/**
 * Lambda function to handle user registration confirmation
 * @param event API Gateway event
 * @returns API Gateway response
 */
const handler = async (event) => {
    try {
        // Parse request body
        if (!event.body) {
            return (0, response_1.errorResponse)(400, 'Missing request body');
        }
        const { username, confirmationCode } = JSON.parse(event.body);
        // Validate required fields
        if (!username || !confirmationCode) {
            return (0, response_1.errorResponse)(400, 'Username and confirmation code are required');
        }
        // Confirm registration in Cognito
        const confirmSignUpParams = {
            ClientId: USER_POOL_CLIENT_ID,
            Username: username,
            ConfirmationCode: confirmationCode,
        };
        await cognito.confirmSignUp(confirmSignUpParams).promise();
        // Update user status in DynamoDB
        // First, find the user by email
        const queryResult = await (0, dynamodb_1.queryItems)('GSI2PK = :email', { ':email': `EMAIL#${username}` }, 'GSI2');
        if (!queryResult.Items || queryResult.Items.length === 0) {
            return (0, response_1.errorResponse)(404, 'User not found');
        }
        const user = queryResult.Items[0];
        // Update the user status to CONFIRMED
        await (0, dynamodb_1.updateItem)({ PK: user.PK, SK: user.SK }, 'SET #status = :status, #updatedAt = :updatedAt', {
            ':status': 'CONFIRMED',
            ':updatedAt': new Date().toISOString(),
        });
        return (0, response_1.successResponse)({
            message: 'User registration confirmed successfully',
            username: user.username,
        });
    }
    catch (error) {
        console.error('Error confirming registration:', error);
        if (error.code === 'CodeMismatchException') {
            return (0, response_1.errorResponse)(400, 'Invalid confirmation code');
        }
        if (error.code === 'ExpiredCodeException') {
            return (0, response_1.errorResponse)(400, 'Confirmation code has expired');
        }
        if (error.code === 'UserNotFoundException') {
            return (0, response_1.errorResponse)(404, 'User not found');
        }
        return (0, response_1.errorResponse)(500, 'Error confirming registration');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlybS1yZWdpc3RyYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0aC9jb25maXJtLXJlZ2lzdHJhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBeUQ7QUFDekQsZ0RBQW1FO0FBQ25FLGdEQUEyRDtBQUUzRCw0QkFBNEI7QUFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBSSx3Q0FBOEIsRUFBRSxDQUFDO0FBRXJELDRCQUE0QjtBQUM1QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7QUFDcEQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixJQUFJLEVBQUUsQ0FBQztBQUVsRTs7OztHQUlHO0FBQ0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsSUFBSSxDQUFDO1FBQ0gscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsZ0JBQWdCLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU5RCwyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDbkMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLDZDQUE2QyxDQUFDLENBQUM7UUFDM0UsQ0FBQztRQUVELGtDQUFrQztRQUNsQyxNQUFNLG1CQUFtQixHQUFHO1lBQzFCLFFBQVEsRUFBRSxtQkFBbUI7WUFDN0IsUUFBUSxFQUFFLFFBQVE7WUFDbEIsZ0JBQWdCLEVBQUUsZ0JBQWdCO1NBQ25DLENBQUM7UUFFRixNQUFNLE9BQU8sQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUUzRCxpQ0FBaUM7UUFDakMsZ0NBQWdDO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLE1BQU0sSUFBQSxxQkFBVSxFQUNsQyxpQkFBaUIsRUFDakIsRUFBRSxRQUFRLEVBQUUsU0FBUyxRQUFRLEVBQUUsRUFBRSxFQUNqQyxNQUFNLENBQ1AsQ0FBQztRQUVGLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQ3pELE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWxDLHNDQUFzQztRQUN0QyxNQUFNLElBQUEscUJBQVUsRUFDZCxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQzVCLGdEQUFnRCxFQUNoRDtZQUNFLFNBQVMsRUFBRSxXQUFXO1lBQ3RCLFlBQVksRUFBRSxJQUFJLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRTtTQUN2QyxDQUNGLENBQUM7UUFFRixPQUFPLElBQUEsMEJBQWUsRUFBQztZQUNyQixPQUFPLEVBQUUsMENBQTBDO1lBQ25ELFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUN4QixDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXZELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyx1QkFBdUIsRUFBRSxDQUFDO1lBQzNDLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBQ3pELENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssc0JBQXNCLEVBQUUsQ0FBQztZQUMxQyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsK0JBQStCLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLHVCQUF1QixFQUFFLENBQUM7WUFDM0MsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7UUFDOUMsQ0FBQztRQUVELE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0lBQzdELENBQUM7QUFDSCxDQUFDLENBQUM7QUFwRVcsUUFBQSxPQUFPLFdBb0VsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUV2ZW50LCBBUElHYXRld2F5UHJveHlSZXN1bHQgfSBmcm9tICdhd3MtbGFtYmRhJztcbmltcG9ydCB7IENvZ25pdG9JZGVudGl0eVNlcnZpY2VQcm92aWRlciB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xuaW1wb3J0IHsgcXVlcnlJdGVtcywgdXBkYXRlSXRlbSB9IGZyb20gJy4uL3V0aWxzL2R5bmFtb2RiJztcblxuLy8gSW5pdGlhbGl6ZSBDb2duaXRvIGNsaWVudFxuY29uc3QgY29nbml0byA9IG5ldyBDb2duaXRvSWRlbnRpdHlTZXJ2aWNlUHJvdmlkZXIoKTtcblxuLy8gR2V0IGVudmlyb25tZW50IHZhcmlhYmxlc1xuY29uc3QgVVNFUl9QT09MX0lEID0gcHJvY2Vzcy5lbnYuVVNFUl9QT09MX0lEIHx8ICcnO1xuY29uc3QgVVNFUl9QT09MX0NMSUVOVF9JRCA9IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQgfHwgJyc7XG5cbi8qKlxuICogTGFtYmRhIGZ1bmN0aW9uIHRvIGhhbmRsZSB1c2VyIHJlZ2lzdHJhdGlvbiBjb25maXJtYXRpb25cbiAqIEBwYXJhbSBldmVudCBBUEkgR2F0ZXdheSBldmVudFxuICogQHJldHVybnMgQVBJIEdhdGV3YXkgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBQYXJzZSByZXF1ZXN0IGJvZHlcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgcmVxdWVzdCBib2R5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB1c2VybmFtZSwgY29uZmlybWF0aW9uQ29kZSB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghdXNlcm5hbWUgfHwgIWNvbmZpcm1hdGlvbkNvZGUpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ1VzZXJuYW1lIGFuZCBjb25maXJtYXRpb24gY29kZSBhcmUgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBDb25maXJtIHJlZ2lzdHJhdGlvbiBpbiBDb2duaXRvXG4gICAgY29uc3QgY29uZmlybVNpZ25VcFBhcmFtcyA9IHtcbiAgICAgIENsaWVudElkOiBVU0VSX1BPT0xfQ0xJRU5UX0lELFxuICAgICAgVXNlcm5hbWU6IHVzZXJuYW1lLFxuICAgICAgQ29uZmlybWF0aW9uQ29kZTogY29uZmlybWF0aW9uQ29kZSxcbiAgICB9O1xuXG4gICAgYXdhaXQgY29nbml0by5jb25maXJtU2lnblVwKGNvbmZpcm1TaWduVXBQYXJhbXMpLnByb21pc2UoKTtcblxuICAgIC8vIFVwZGF0ZSB1c2VyIHN0YXR1cyBpbiBEeW5hbW9EQlxuICAgIC8vIEZpcnN0LCBmaW5kIHRoZSB1c2VyIGJ5IGVtYWlsXG4gICAgY29uc3QgcXVlcnlSZXN1bHQgPSBhd2FpdCBxdWVyeUl0ZW1zKFxuICAgICAgJ0dTSTJQSyA9IDplbWFpbCcsXG4gICAgICB7ICc6ZW1haWwnOiBgRU1BSUwjJHt1c2VybmFtZX1gIH0sXG4gICAgICAnR1NJMidcbiAgICApO1xuXG4gICAgaWYgKCFxdWVyeVJlc3VsdC5JdGVtcyB8fCBxdWVyeVJlc3VsdC5JdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwNCwgJ1VzZXIgbm90IGZvdW5kJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdXNlciA9IHF1ZXJ5UmVzdWx0Lkl0ZW1zWzBdO1xuICAgIFxuICAgIC8vIFVwZGF0ZSB0aGUgdXNlciBzdGF0dXMgdG8gQ09ORklSTUVEXG4gICAgYXdhaXQgdXBkYXRlSXRlbShcbiAgICAgIHsgUEs6IHVzZXIuUEssIFNLOiB1c2VyLlNLIH0sXG4gICAgICAnU0VUICNzdGF0dXMgPSA6c3RhdHVzLCAjdXBkYXRlZEF0ID0gOnVwZGF0ZWRBdCcsXG4gICAgICB7XG4gICAgICAgICc6c3RhdHVzJzogJ0NPTkZJUk1FRCcsXG4gICAgICAgICc6dXBkYXRlZEF0JzogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgfVxuICAgICk7XG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHtcbiAgICAgIG1lc3NhZ2U6ICdVc2VyIHJlZ2lzdHJhdGlvbiBjb25maXJtZWQgc3VjY2Vzc2Z1bGx5JyxcbiAgICAgIHVzZXJuYW1lOiB1c2VyLnVzZXJuYW1lLFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcjogYW55KSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgY29uZmlybWluZyByZWdpc3RyYXRpb246JywgZXJyb3IpO1xuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdDb2RlTWlzbWF0Y2hFeGNlcHRpb24nKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIGNvbmZpcm1hdGlvbiBjb2RlJyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdFeHBpcmVkQ29kZUV4Y2VwdGlvbicpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ0NvbmZpcm1hdGlvbiBjb2RlIGhhcyBleHBpcmVkJyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdVc2VyTm90Rm91bmRFeGNlcHRpb24nKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDQsICdVc2VyIG5vdCBmb3VuZCcpO1xuICAgIH1cblxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDUwMCwgJ0Vycm9yIGNvbmZpcm1pbmcgcmVnaXN0cmF0aW9uJyk7XG4gIH1cbn07XG4iXX0=