# BlockPulse

A cloud-native community management application built on AWS.

## Overview

BlockPulse is a full-stack application that enables users to:
- Sign up, log in, and join communities
- Create and manage communities as admins
- Post announcements to community members
- Chat in real-time with other community participants

## Architecture

- **Frontend**: React-based Progressive Web App (PWA)
- **Backend**: Serverless architecture using AWS Lambda, API Gateway, and DynamoDB
- **Authentication**: AWS Cognito
- **Infrastructure**: Provisioned using AWS CDK
- **CI/CD**: Automated with GitHub Actions and AWS CodePipeline

## Development

### Prerequisites
- Node.js 18+
- AWS CLI configured with appropriate permissions
- AWS CDK installed globally

### Setup
```bash
# Clone the repository
git clone https://github.com/SunilDarna/blockpulse-prod.git
cd blockpulse-prod

# Install dependencies
npm install

# Bootstrap CDK (if not already done)
cdk bootstrap
```

## Deployment

Details on deployment process will be added as the project progresses.

## License

Copyright © 2025 Anvi Innovate. All rights reserved.
