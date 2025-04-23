# BlockPulse Community Creation Flow

## Authentication Flow
1. **User Login Process**
   - Users access the login page at `/login`
   - The login form accepts either email or username with password
   - Authentication is handled through AWS Cognito via the Amplify library
   - Login credentials are submitted to Cognito for verification
   - Upon successful authentication, JWT tokens are stored and managed by Amplify
   - User data is stored in Redux state via the `authSlice.js` reducer

2. **Authentication Configuration**
   - AWS Cognito is configured in the us-east-1 region
   - User Pool ID: us-east-1_jnC202YPi
   - App Client ID: 57b85raqi80idfomik8goqg3nv
   - API endpoints are secured with Cognito tokens

## Community Creation Process
1. **Accessing Community Creation**
   - After login, authenticated users can access the "Create Community" page
   - The form is implemented in `/frontend/src/pages/CreateCommunity.js`
   - Form validation is handled by Formik and Yup libraries

2. **Form Fields and Validation**
   - Community Name (3-50 characters, required)
   - Description (10-500 characters, required)
   - Join Type (radio buttons: "Open" or "Invite Only")
   - Tags (comma-separated, optional)

3. **Frontend Implementation**
   - Form submission dispatches the `createCommunity` Redux action
   - The action is defined in `/frontend/src/features/community/communitySlice.js`
   - The action calls `communityService.createCommunity()` from `/frontend/src/services/communityService.js`
   - AWS Amplify's API module handles the authenticated API request

4. **API Request Flow**
   - The request is sent to the API Gateway endpoint at `https://blockpulse-api.anviinnovate.com/v1/communities`
   - The request includes:
     - Community data in the request body
     - Authentication token in the Authorization header
     - Content-Type: application/json header

5. **Backend Processing**
   - The API Gateway routes the request to the `createCommunity` Lambda function
   - The Lambda function (/backend/functions/createCommunity.js):
     - Extracts user information from the JWT token
     - Validates the required fields
     - Generates a unique community ID using UUID
     - Creates three DynamoDB items in a transaction:
       1. Community metadata record (PK: COMMUNITY#id, SK: METADATA#id)
       2. Creator's membership record (PK: COMMUNITY#id, SK: MEMBER#userId)
       3. User's community reference (PK: USER#userId, SK: COMMUNITY#id)
     - Returns the created community details

6. **Response Handling**
   - On success (201 status):
     - The frontend updates the Redux store with the new community
     - A success message is displayed to the user
     - After a short delay, the user is redirected to the new community page
   - On failure:
     - Error messages are displayed to the user
     - The form remains active for corrections

7. **Data Model**
   - Communities are stored in DynamoDB with a composite key structure
   - Each community has metadata, members, and user references
   - The creator is automatically assigned the "admin" role
   - Community join types can be "open" (anyone can join) or "invite" (requires approval)

## Security Considerations
1. All API requests require valid JWT tokens from Cognito
2. The Lambda authorizer validates tokens before allowing access
3. DynamoDB access patterns are designed for secure, efficient queries
4. CORS is configured to prevent unauthorized cross-origin requests

This implementation follows AWS best practices for serverless applications, with proper separation of concerns between frontend and backend components. The community creation process is designed to be intuitive for users while maintaining data integrity and security.
