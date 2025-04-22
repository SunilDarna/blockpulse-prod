# BlockPulse - Community Management Platform

BlockPulse is a cloud-native application that enables users to create and join communities, post announcements, and chat in real-time with other community participants.

## Production Deployment Status

The production application is deployed and accessible at:
- **Website URL**: [https://blockpulse.anviinnovate.com](https://blockpulse.anviinnovate.com)
- **CloudFront Distribution**: d2ihfjzp4zndph.cloudfront.net
- **API Endpoint**: https://[api-gateway-id].execute-api.us-east-1.amazonaws.com/v1/
- **Cognito Domain**: blockpulse-prod.auth.us-east-1.amazoncognito.com

## Authentication System

The authentication system provides the following features:

- User registration with email verification
- Login with username or email
- Session management with JWT tokens
- Token refresh mechanism
- Secure password reset flow
- Automatic cleanup of unconfirmed users
- Prevention of duplicate email registrations

## Architecture

The application is built using the following AWS services:

- **Amazon Cognito**: User authentication and authorization
- **Amazon DynamoDB**: NoSQL database for storing user and community data
- **Amazon S3**: Storage for user uploads and static assets
- **AWS Lambda**: Serverless functions for API endpoints
- **Amazon API Gateway**: REST API and WebSocket API endpoints
- **AWS CloudFront**: Content delivery network for the frontend
- **AWS Route53**: DNS management for the domain
- **AWS Certificate Manager**: SSL/TLS certificate management
- **AWS CDK**: Infrastructure as code for deployment

## Getting Started

### Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate credentials
- AWS CDK installed globally

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/SunilDarna/blockpulse-prod.git
   cd blockpulse-prod
   ```

2. Install dependencies:
   ```
   # Install backend dependencies
   cd backend
   npm install
   npm run build
   cd ..

   # Install CDK dependencies
   cd cdk
   npm install
   npm run build
   cd ..

   # Install frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. Deploy the infrastructure:
   ```
   cd cdk
   npx cdk deploy BlockPulseDevStack
   ```

4. Run the frontend locally:
   ```
   cd frontend
   npm start
   ```

## Testing

Run the authentication test script to verify the authentication flow:

```
./test-auth.sh
```

This script tests:
- User registration
- Email verification
- Login
- Token refresh
- Password reset
- Logout
- Duplicate user detection

## Development

### Backend

The backend is built with TypeScript and AWS Lambda. The source code is in the `backend/src` directory.

To build the backend:
```
cd backend
npm run build
```

### Frontend

The frontend is a React application. The source code is in the `frontend/src` directory.

To start the frontend development server:
```
cd frontend
npm start
```

### Infrastructure

The infrastructure is defined using AWS CDK. The code is in the `cdk/lib` directory.

To deploy changes to the infrastructure:
```
cd cdk
npm run build
npx cdk deploy BlockPulseDevStack
```

## Production Deployment

For production deployment:

```
cd cdk
npm run build
npx cdk deploy BlockPulseProdStack
```

The production web application is hosted at https://blockpulse.anviinnovate.com/

## Security Features

- All API endpoints are protected with JWT-based authorization
- S3 bucket configured with block public access
- DynamoDB tables with encryption at rest
- Cognito user pool with secure password policies
- HTTPS enforced for all communications
- Automatic cleanup of unconfirmed users to prevent abuse
