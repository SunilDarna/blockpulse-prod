# BlockPulse CDK Infrastructure

This directory contains the AWS CDK code for provisioning the BlockPulse application infrastructure.

## Architecture Components

The BlockPulse infrastructure includes:

- **Cognito User Pool**: For user authentication and management
- **DynamoDB Tables**: For storing community, member, announcement, and chat data
- **S3 Bucket**: For storing static assets and user uploads
- **REST API Gateway**: For handling HTTP requests to backend services
- **WebSocket API**: For real-time chat functionality

## Getting Started

### Prerequisites

- Node.js 18+
- AWS CLI configured with appropriate permissions
- AWS CDK installed globally (`npm install -g aws-cdk`)

### Setup

```bash
# Install dependencies
npm install

# Build the TypeScript code
npm run build

# Run tests
npm test
```

### Deployment

```bash
# Deploy to development environment
cdk deploy BlockPulseDevStack

# Deploy to production environment
cdk deploy BlockPulseProdStack
```

## Useful CDK Commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
