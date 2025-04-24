"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const response_1 = require("../utils/response");
// Initialize Cognito client
const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';
/**
 * Lambda function to resend confirmation code
 * @param event API Gateway event
 * @returns API Gateway response
 */
const handler = async (event) => {
    try {
        // Parse request body
        if (!event.body) {
            return (0, response_1.errorResponse)(400, 'Missing request body');
        }
        const { username } = JSON.parse(event.body);
        // Validate required fields
        if (!username) {
            return (0, response_1.errorResponse)(400, 'Username is required');
        }
        // Resend confirmation code
        const resendParams = {
            ClientId: USER_POOL_CLIENT_ID,
            Username: username,
        };
        await cognito.resendConfirmationCode(resendParams).promise();
        return (0, response_1.successResponse)({
            message: 'Confirmation code resent successfully',
            username,
        });
    }
    catch (error) {
        console.error('Error resending confirmation code:', error);
        if (error.code === 'UserNotFoundException') {
            return (0, response_1.errorResponse)(404, 'User not found');
        }
        if (error.code === 'LimitExceededException') {
            return (0, response_1.errorResponse)(429, 'Too many requests, please try again later');
        }
        if (error.code === 'InvalidParameterException' && error.message.includes('already confirmed')) {
            return (0, response_1.errorResponse)(400, 'User is already confirmed');
        }
        return (0, response_1.errorResponse)(500, 'Error resending confirmation code');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzZW5kLWNvbmZpcm1hdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hdXRoL3Jlc2VuZC1jb25maXJtYXRpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EscUNBQXlEO0FBQ3pELGdEQUFtRTtBQUVuRSw0QkFBNEI7QUFDNUIsTUFBTSxPQUFPLEdBQUcsSUFBSSx3Q0FBOEIsRUFBRSxDQUFDO0FBRXJELDRCQUE0QjtBQUM1QixNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUM7QUFDcEQsTUFBTSxtQkFBbUIsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixJQUFJLEVBQUUsQ0FBQztBQUVsRTs7OztHQUlHO0FBQ0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsSUFBSSxDQUFDO1FBQ0gscUJBQXFCO1FBQ3JCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDaEIsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUU1QywyQkFBMkI7UUFDM0IsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ2QsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLHNCQUFzQixDQUFDLENBQUM7UUFDcEQsQ0FBQztRQUVELDJCQUEyQjtRQUMzQixNQUFNLFlBQVksR0FBRztZQUNuQixRQUFRLEVBQUUsbUJBQW1CO1lBQzdCLFFBQVEsRUFBRSxRQUFRO1NBQ25CLENBQUM7UUFFRixNQUFNLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUU3RCxPQUFPLElBQUEsMEJBQWUsRUFBQztZQUNyQixPQUFPLEVBQUUsdUNBQXVDO1lBQ2hELFFBQVE7U0FDVCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBQUMsT0FBTyxLQUFVLEVBQUUsQ0FBQztRQUNwQixPQUFPLENBQUMsS0FBSyxDQUFDLG9DQUFvQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRTNELElBQUksS0FBSyxDQUFDLElBQUksS0FBSyx1QkFBdUIsRUFBRSxDQUFDO1lBQzNDLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO1FBQzlDLENBQUM7UUFFRCxJQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssd0JBQXdCLEVBQUUsQ0FBQztZQUM1QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztRQUN6RSxDQUFDO1FBRUQsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLDJCQUEyQixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLG1CQUFtQixDQUFDLEVBQUUsQ0FBQztZQUM5RixPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUN6RCxDQUFDO1FBRUQsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7SUFDakUsQ0FBQztBQUNILENBQUMsQ0FBQztBQTNDVyxRQUFBLE9BQU8sV0EyQ2xCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQVBJR2F0ZXdheVByb3h5RXZlbnQsIEFQSUdhdGV3YXlQcm94eVJlc3VsdCB9IGZyb20gJ2F3cy1sYW1iZGEnO1xuaW1wb3J0IHsgQ29nbml0b0lkZW50aXR5U2VydmljZVByb3ZpZGVyIH0gZnJvbSAnYXdzLXNkayc7XG5pbXBvcnQgeyBzdWNjZXNzUmVzcG9uc2UsIGVycm9yUmVzcG9uc2UgfSBmcm9tICcuLi91dGlscy9yZXNwb25zZSc7XG5cbi8vIEluaXRpYWxpemUgQ29nbml0byBjbGllbnRcbmNvbnN0IGNvZ25pdG8gPSBuZXcgQ29nbml0b0lkZW50aXR5U2VydmljZVByb3ZpZGVyKCk7XG5cbi8vIEdldCBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbmNvbnN0IFVTRVJfUE9PTF9JRCA9IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9JRCB8fCAnJztcbmNvbnN0IFVTRVJfUE9PTF9DTElFTlRfSUQgPSBwcm9jZXNzLmVudi5VU0VSX1BPT0xfQ0xJRU5UX0lEIHx8ICcnO1xuXG4vKipcbiAqIExhbWJkYSBmdW5jdGlvbiB0byByZXNlbmQgY29uZmlybWF0aW9uIGNvZGVcbiAqIEBwYXJhbSBldmVudCBBUEkgR2F0ZXdheSBldmVudFxuICogQHJldHVybnMgQVBJIEdhdGV3YXkgcmVzcG9uc2VcbiAqL1xuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBQYXJzZSByZXF1ZXN0IGJvZHlcbiAgICBpZiAoIWV2ZW50LmJvZHkpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ01pc3NpbmcgcmVxdWVzdCBib2R5Jyk7XG4gICAgfVxuXG4gICAgY29uc3QgeyB1c2VybmFtZSB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5KTtcblxuICAgIC8vIFZhbGlkYXRlIHJlcXVpcmVkIGZpZWxkc1xuICAgIGlmICghdXNlcm5hbWUpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ1VzZXJuYW1lIGlzIHJlcXVpcmVkJyk7XG4gICAgfVxuXG4gICAgLy8gUmVzZW5kIGNvbmZpcm1hdGlvbiBjb2RlXG4gICAgY29uc3QgcmVzZW5kUGFyYW1zID0ge1xuICAgICAgQ2xpZW50SWQ6IFVTRVJfUE9PTF9DTElFTlRfSUQsXG4gICAgICBVc2VybmFtZTogdXNlcm5hbWUsXG4gICAgfTtcblxuICAgIGF3YWl0IGNvZ25pdG8ucmVzZW5kQ29uZmlybWF0aW9uQ29kZShyZXNlbmRQYXJhbXMpLnByb21pc2UoKTtcblxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2Uoe1xuICAgICAgbWVzc2FnZTogJ0NvbmZpcm1hdGlvbiBjb2RlIHJlc2VudCBzdWNjZXNzZnVsbHknLFxuICAgICAgdXNlcm5hbWUsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZXNlbmRpbmcgY29uZmlybWF0aW9uIGNvZGU6JywgZXJyb3IpO1xuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdVc2VyTm90Rm91bmRFeGNlcHRpb24nKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDQsICdVc2VyIG5vdCBmb3VuZCcpO1xuICAgIH1cblxuICAgIGlmIChlcnJvci5jb2RlID09PSAnTGltaXRFeGNlZWRlZEV4Y2VwdGlvbicpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQyOSwgJ1RvbyBtYW55IHJlcXVlc3RzLCBwbGVhc2UgdHJ5IGFnYWluIGxhdGVyJyk7XG4gICAgfVxuXG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdJbnZhbGlkUGFyYW1ldGVyRXhjZXB0aW9uJyAmJiBlcnJvci5tZXNzYWdlLmluY2x1ZGVzKCdhbHJlYWR5IGNvbmZpcm1lZCcpKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdVc2VyIGlzIGFscmVhZHkgY29uZmlybWVkJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNTAwLCAnRXJyb3IgcmVzZW5kaW5nIGNvbmZpcm1hdGlvbiBjb2RlJyk7XG4gIH1cbn07XG4iXX0=