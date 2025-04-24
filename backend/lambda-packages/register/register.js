"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const uuid_1 = require("uuid");
const response_1 = require("../utils/response");
const dynamodb_1 = require("../utils/dynamodb");
// Initialize Cognito client
const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
// Get environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || '';
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';
/**
 * Lambda function to handle user registration
 * @param event API Gateway event
 * @returns API Gateway response
 */
const handler = async (event) => {
    try {
        // Parse request body
        if (!event.body) {
            return (0, response_1.errorResponse)(400, 'Missing request body');
        }
        const { firstName, lastName, email, password, confirmPassword } = JSON.parse(event.body);
        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            return (0, response_1.errorResponse)(400, 'All fields are required');
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return (0, response_1.errorResponse)(400, 'Invalid email format');
        }
        // Validate password strength
        if (password.length < 8) {
            return (0, response_1.errorResponse)(400, 'Password must be at least 8 characters long');
        }
        // Check if passwords match
        if (password !== confirmPassword) {
            return (0, response_1.errorResponse)(400, 'Passwords do not match');
        }
        // Generate a unique username (combination of name and random string)
        const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${(0, uuid_1.v4)().substring(0, 8)}`;
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
        await (0, dynamodb_1.putItem)(userItem);
        return (0, response_1.successResponse)({
            message: 'User registration successful. Please check your email for verification code.',
            username: username, // Return the generated username instead of email
            userSub: signUpResult.UserSub,
        });
    }
    catch (error) {
        console.error('Error registering user:', error);
        if (error.code === 'UsernameExistsException') {
            return (0, response_1.errorResponse)(409, 'An account with this email already exists');
        }
        if (error.code === 'InvalidPasswordException') {
            return (0, response_1.errorResponse)(400, 'Password does not meet complexity requirements');
        }
        return (0, response_1.errorResponse)(500, 'Error registering user');
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXV0aC9yZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxxQ0FBeUQ7QUFDekQsK0JBQW9DO0FBQ3BDLGdEQUFtRTtBQUNuRSxnREFBNEM7QUFFNUMsNEJBQTRCO0FBQzVCLE1BQU0sT0FBTyxHQUFHLElBQUksd0NBQThCLEVBQUUsQ0FBQztBQUVyRCw0QkFBNEI7QUFDNUIsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDO0FBQ3BELE1BQU0sbUJBQW1CLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsSUFBSSxFQUFFLENBQUM7QUFFbEU7Ozs7R0FJRztBQUNJLE1BQU0sT0FBTyxHQUFHLEtBQUssRUFBRSxLQUEyQixFQUFrQyxFQUFFO0lBQzNGLElBQUksQ0FBQztRQUNILHFCQUFxQjtRQUNyQixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2hCLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCxNQUFNLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRXpGLDJCQUEyQjtRQUMzQixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsUUFBUSxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7WUFDdkUsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLHlCQUF5QixDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELHdCQUF3QjtRQUN4QixNQUFNLFVBQVUsR0FBRyw0QkFBNEIsQ0FBQztRQUNoRCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1lBQzVCLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO1FBQ3BELENBQUM7UUFFRCw2QkFBNkI7UUFDN0IsSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1lBQ3hCLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSw2Q0FBNkMsQ0FBQyxDQUFDO1FBQzNFLENBQUM7UUFFRCwyQkFBMkI7UUFDM0IsSUFBSSxRQUFRLEtBQUssZUFBZSxFQUFFLENBQUM7WUFDakMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLHdCQUF3QixDQUFDLENBQUM7UUFDdEQsQ0FBQztRQUVELHFFQUFxRTtRQUNyRSxNQUFNLFFBQVEsR0FBRyxHQUFHLFNBQVMsQ0FBQyxXQUFXLEVBQUUsSUFBSSxRQUFRLENBQUMsV0FBVyxFQUFFLElBQUksSUFBQSxTQUFNLEdBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFcEcsMkJBQTJCO1FBQzNCLE1BQU0sWUFBWSxHQUFHO1lBQ25CLFFBQVEsRUFBRSxtQkFBbUI7WUFDN0IsUUFBUSxFQUFFLFFBQVEsRUFBRSwwQ0FBMEM7WUFDOUQsUUFBUSxFQUFFLFFBQVE7WUFDbEIsY0FBYyxFQUFFO2dCQUNkO29CQUNFLElBQUksRUFBRSxZQUFZO29CQUNsQixLQUFLLEVBQUUsU0FBUztpQkFDakI7Z0JBQ0Q7b0JBQ0UsSUFBSSxFQUFFLGFBQWE7b0JBQ25CLEtBQUssRUFBRSxRQUFRO2lCQUNoQjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsT0FBTztvQkFDYixLQUFLLEVBQUUsS0FBSztpQkFDYjtnQkFDRDtvQkFDRSxJQUFJLEVBQUUsb0JBQW9CO29CQUMxQixLQUFLLEVBQUUsUUFBUTtpQkFDaEI7YUFDRjtTQUNGLENBQUM7UUFFRixNQUFNLFlBQVksR0FBRyxNQUFNLE9BQU8sQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFFbEUseUNBQXlDO1FBQ3pDLE1BQU0sU0FBUyxHQUFHLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDM0MsTUFBTSxRQUFRLEdBQUc7WUFDZixFQUFFLEVBQUUsUUFBUSxZQUFZLENBQUMsT0FBTyxFQUFFO1lBQ2xDLEVBQUUsRUFBRSxXQUFXLFlBQVksQ0FBQyxPQUFPLEVBQUU7WUFDckMsTUFBTSxFQUFFLFFBQVEsUUFBUSxFQUFFO1lBQzFCLE1BQU0sRUFBRSxRQUFRLFFBQVEsRUFBRTtZQUMxQixNQUFNLEVBQUUsU0FBUyxLQUFLLEVBQUU7WUFDeEIsTUFBTSxFQUFFLFFBQVEsWUFBWSxDQUFDLE9BQU8sRUFBRTtZQUN0QyxNQUFNLEVBQUUsWUFBWSxDQUFDLE9BQU87WUFDNUIsUUFBUTtZQUNSLEtBQUs7WUFDTCxTQUFTO1lBQ1QsUUFBUTtZQUNSLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLFNBQVMsRUFBRSxTQUFTO1lBQ3BCLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLElBQUksRUFBRSxNQUFNO1NBQ2IsQ0FBQztRQUVGLE1BQU0sSUFBQSxrQkFBTyxFQUFDLFFBQVEsQ0FBQyxDQUFDO1FBRXhCLE9BQU8sSUFBQSwwQkFBZSxFQUFDO1lBQ3JCLE9BQU8sRUFBRSw4RUFBOEU7WUFDdkYsUUFBUSxFQUFFLFFBQVEsRUFBRSxpREFBaUQ7WUFDckUsT0FBTyxFQUFFLFlBQVksQ0FBQyxPQUFPO1NBQzlCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFBQyxPQUFPLEtBQVUsRUFBRSxDQUFDO1FBQ3BCLE9BQU8sQ0FBQyxLQUFLLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFaEQsSUFBSSxLQUFLLENBQUMsSUFBSSxLQUFLLHlCQUF5QixFQUFFLENBQUM7WUFDN0MsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLDJDQUEyQyxDQUFDLENBQUM7UUFDekUsQ0FBQztRQUVELElBQUksS0FBSyxDQUFDLElBQUksS0FBSywwQkFBMEIsRUFBRSxDQUFDO1lBQzlDLE9BQU8sSUFBQSx3QkFBYSxFQUFDLEdBQUcsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO1FBQzlFLENBQUM7UUFFRCxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLEVBQUUsd0JBQXdCLENBQUMsQ0FBQztJQUN0RCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBcEdXLFFBQUEsT0FBTyxXQW9HbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBDb2duaXRvSWRlbnRpdHlTZXJ2aWNlUHJvdmlkZXIgfSBmcm9tICdhd3Mtc2RrJztcbmltcG9ydCB7IHY0IGFzIHV1aWR2NCB9IGZyb20gJ3V1aWQnO1xuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSAnLi4vdXRpbHMvcmVzcG9uc2UnO1xuaW1wb3J0IHsgcHV0SXRlbSB9IGZyb20gJy4uL3V0aWxzL2R5bmFtb2RiJztcblxuLy8gSW5pdGlhbGl6ZSBDb2duaXRvIGNsaWVudFxuY29uc3QgY29nbml0byA9IG5ldyBDb2duaXRvSWRlbnRpdHlTZXJ2aWNlUHJvdmlkZXIoKTtcblxuLy8gR2V0IGVudmlyb25tZW50IHZhcmlhYmxlc1xuY29uc3QgVVNFUl9QT09MX0lEID0gcHJvY2Vzcy5lbnYuVVNFUl9QT09MX0lEIHx8ICcnO1xuY29uc3QgVVNFUl9QT09MX0NMSUVOVF9JRCA9IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQgfHwgJyc7XG5cbi8qKlxuICogTGFtYmRhIGZ1bmN0aW9uIHRvIGhhbmRsZSB1c2VyIHJlZ2lzdHJhdGlvblxuICogQHBhcmFtIGV2ZW50IEFQSSBHYXRld2F5IGV2ZW50XG4gKiBAcmV0dXJucyBBUEkgR2F0ZXdheSByZXNwb25zZVxuICovXG5leHBvcnQgY29uc3QgaGFuZGxlciA9IGFzeW5jIChldmVudDogQVBJR2F0ZXdheVByb3h5RXZlbnQpOiBQcm9taXNlPEFQSUdhdGV3YXlQcm94eVJlc3VsdD4gPT4ge1xuICB0cnkge1xuICAgIC8vIFBhcnNlIHJlcXVlc3QgYm9keVxuICAgIGlmICghZXZlbnQuYm9keSkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnTWlzc2luZyByZXF1ZXN0IGJvZHknKTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGZpcnN0TmFtZSwgbGFzdE5hbWUsIGVtYWlsLCBwYXNzd29yZCwgY29uZmlybVBhc3N3b3JkIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkpO1xuXG4gICAgLy8gVmFsaWRhdGUgcmVxdWlyZWQgZmllbGRzXG4gICAgaWYgKCFmaXJzdE5hbWUgfHwgIWxhc3ROYW1lIHx8ICFlbWFpbCB8fCAhcGFzc3dvcmQgfHwgIWNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnQWxsIGZpZWxkcyBhcmUgcmVxdWlyZWQnKTtcbiAgICB9XG5cbiAgICAvLyBWYWxpZGF0ZSBlbWFpbCBmb3JtYXRcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XG4gICAgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZW1haWwpKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDAsICdJbnZhbGlkIGVtYWlsIGZvcm1hdCcpO1xuICAgIH1cblxuICAgIC8vIFZhbGlkYXRlIHBhc3N3b3JkIHN0cmVuZ3RoXG4gICAgaWYgKHBhc3N3b3JkLmxlbmd0aCA8IDgpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDQwMCwgJ1Bhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzIGxvbmcnKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBwYXNzd29yZHMgbWF0Y2hcbiAgICBpZiAocGFzc3dvcmQgIT09IGNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnUGFzc3dvcmRzIGRvIG5vdCBtYXRjaCcpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIGEgdW5pcXVlIHVzZXJuYW1lIChjb21iaW5hdGlvbiBvZiBuYW1lIGFuZCByYW5kb20gc3RyaW5nKVxuICAgIGNvbnN0IHVzZXJuYW1lID0gYCR7Zmlyc3ROYW1lLnRvTG93ZXJDYXNlKCl9XyR7bGFzdE5hbWUudG9Mb3dlckNhc2UoKX1fJHt1dWlkdjQoKS5zdWJzdHJpbmcoMCwgOCl9YDtcblxuICAgIC8vIFJlZ2lzdGVyIHVzZXIgaW4gQ29nbml0b1xuICAgIGNvbnN0IHNpZ25VcFBhcmFtcyA9IHtcbiAgICAgIENsaWVudElkOiBVU0VSX1BPT0xfQ0xJRU5UX0lELFxuICAgICAgVXNlcm5hbWU6IHVzZXJuYW1lLCAvLyBVc2UgZ2VuZXJhdGVkIHVzZXJuYW1lIGluc3RlYWQgb2YgZW1haWxcbiAgICAgIFBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIFVzZXJBdHRyaWJ1dGVzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBOYW1lOiAnZ2l2ZW5fbmFtZScsXG4gICAgICAgICAgVmFsdWU6IGZpcnN0TmFtZSxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIE5hbWU6ICdmYW1pbHlfbmFtZScsXG4gICAgICAgICAgVmFsdWU6IGxhc3ROYW1lLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgTmFtZTogJ2VtYWlsJyxcbiAgICAgICAgICBWYWx1ZTogZW1haWwsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBOYW1lOiAncHJlZmVycmVkX3VzZXJuYW1lJyxcbiAgICAgICAgICBWYWx1ZTogdXNlcm5hbWUsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgIH07XG5cbiAgICBjb25zdCBzaWduVXBSZXN1bHQgPSBhd2FpdCBjb2duaXRvLnNpZ25VcChzaWduVXBQYXJhbXMpLnByb21pc2UoKTtcblxuICAgIC8vIFN0b3JlIGFkZGl0aW9uYWwgdXNlciBkYXRhIGluIER5bmFtb0RCXG4gICAgY29uc3QgdGltZXN0YW1wID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGNvbnN0IHVzZXJJdGVtID0ge1xuICAgICAgUEs6IGBVU0VSIyR7c2lnblVwUmVzdWx0LlVzZXJTdWJ9YCxcbiAgICAgIFNLOiBgUFJPRklMRSMke3NpZ25VcFJlc3VsdC5Vc2VyU3VifWAsXG4gICAgICBHU0kxUEs6IGBVU0VSIyR7dXNlcm5hbWV9YCxcbiAgICAgIEdTSTFTSzogYFVTRVIjJHt1c2VybmFtZX1gLFxuICAgICAgR1NJMlBLOiBgRU1BSUwjJHtlbWFpbH1gLFxuICAgICAgR1NJMlNLOiBgVVNFUiMke3NpZ25VcFJlc3VsdC5Vc2VyU3VifWAsXG4gICAgICB1c2VySWQ6IHNpZ25VcFJlc3VsdC5Vc2VyU3ViLFxuICAgICAgdXNlcm5hbWUsXG4gICAgICBlbWFpbCxcbiAgICAgIGZpcnN0TmFtZSxcbiAgICAgIGxhc3ROYW1lLFxuICAgICAgY3JlYXRlZEF0OiB0aW1lc3RhbXAsXG4gICAgICB1cGRhdGVkQXQ6IHRpbWVzdGFtcCxcbiAgICAgIHN0YXR1czogJ1VOQ09ORklSTUVEJyxcbiAgICAgIHR5cGU6ICdVU0VSJyxcbiAgICB9O1xuXG4gICAgYXdhaXQgcHV0SXRlbSh1c2VySXRlbSk7XG5cbiAgICByZXR1cm4gc3VjY2Vzc1Jlc3BvbnNlKHtcbiAgICAgIG1lc3NhZ2U6ICdVc2VyIHJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgY2hlY2sgeW91ciBlbWFpbCBmb3IgdmVyaWZpY2F0aW9uIGNvZGUuJyxcbiAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSwgLy8gUmV0dXJuIHRoZSBnZW5lcmF0ZWQgdXNlcm5hbWUgaW5zdGVhZCBvZiBlbWFpbFxuICAgICAgdXNlclN1Yjogc2lnblVwUmVzdWx0LlVzZXJTdWIsXG4gICAgfSk7XG4gIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciByZWdpc3RlcmluZyB1c2VyOicsIGVycm9yKTtcblxuICAgIGlmIChlcnJvci5jb2RlID09PSAnVXNlcm5hbWVFeGlzdHNFeGNlcHRpb24nKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZSg0MDksICdBbiBhY2NvdW50IHdpdGggdGhpcyBlbWFpbCBhbHJlYWR5IGV4aXN0cycpO1xuICAgIH1cblxuICAgIGlmIChlcnJvci5jb2RlID09PSAnSW52YWxpZFBhc3N3b3JkRXhjZXB0aW9uJykge1xuICAgICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoNDAwLCAnUGFzc3dvcmQgZG9lcyBub3QgbWVldCBjb21wbGV4aXR5IHJlcXVpcmVtZW50cycpO1xuICAgIH1cblxuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKDUwMCwgJ0Vycm9yIHJlZ2lzdGVyaW5nIHVzZXInKTtcbiAgfVxufTtcbiJdfQ==