const { Stack } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration, CorsOptions } = require('aws-cdk-lib/aws-apigateway');
const { NodejsFunction } = require('aws-cdk-lib/aws-lambda-nodejs');
const { Runtime } = require('aws-cdk-lib/aws-lambda');
const { Table, AttributeType, BillingMode } = require('aws-cdk-lib/aws-dynamodb');
const { UserPool, UserPoolClient, VerificationEmailStyle } = require('aws-cdk-lib/aws-cognito');

class ApiStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // Create DynamoDB Table
    const table = new Table(this, 'BlockPulseTable', {
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
    });

    // Add GSI for querying communities by tag
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: AttributeType.STRING },
    });

    // Create Cognito User Pool
    const userPool = new UserPool(this, 'BlockPulseUserPool', {
      selfSignUpEnabled: true,
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: true, mutable: true },
        familyName: { required: true, mutable: true },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: 1, // EMAIL_ONLY
      emailSettings: {
        from: 'no-reply@blockpulse.anviinnovate.com',
        replyTo: 'support@blockpulse.anviinnovate.com',
      },
    });

    // Create User Pool Client
    const userPoolClient = new UserPoolClient(this, 'BlockPulseUserPoolClient', {
      userPool,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    });

    // Create API Gateway
    const api = new RestApi(this, 'BlockPulseApi', {
      defaultCorsPreflightOptions: {
        allowOrigins: ['*'], // In production, restrict to your domain
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true,
      },
    });

    // Create Lambda Functions
    const createCommunityFunction = new NodejsFunction(this, 'CreateCommunityFunction', {
      entry: 'functions/createCommunity.js',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DYNAMODB_TABLE: table.tableName,
      },
    });

    const listCommunitiesFunction = new NodejsFunction(this, 'ListCommunitiesFunction', {
      entry: 'functions/listCommunities.js',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DYNAMODB_TABLE: table.tableName,
      },
    });

    const getCommunityFunction = new NodejsFunction(this, 'GetCommunityFunction', {
      entry: 'functions/getCommunity.js',
      handler: 'handler',
      runtime: Runtime.NODEJS_18_X,
      environment: {
        DYNAMODB_TABLE: table.tableName,
      },
    });

    // Grant permissions
    table.grantReadWriteData(createCommunityFunction);
    table.grantReadData(listCommunitiesFunction);
    table.grantReadData(getCommunityFunction);

    // Create API resources and methods
    const communitiesResource = api.root.addResource('communities');
    
    // Add CORS options to communities resource
    communitiesResource.addMethod('OPTIONS', new LambdaIntegration(createCommunityFunction), {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Headers': true,
            'method.response.header.Access-Control-Allow-Methods': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        }
      ]
    });
    
    // POST /communities - Create a community
    communitiesResource.addMethod('POST', new LambdaIntegration(createCommunityFunction), {
      methodResponses: [
        {
          statusCode: '201',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        },
        {
          statusCode: '500',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        }
      ]
    });
    
    // GET /communities/user - List user's communities
    const userCommunitiesResource = communitiesResource.addResource('user');
    userCommunitiesResource.addMethod('GET', new LambdaIntegration(listCommunitiesFunction));
    
    // GET /communities/{communityId} - Get a community by ID
    const communityResource = communitiesResource.addResource('{communityId}');
    communityResource.addMethod('GET', new LambdaIntegration(getCommunityFunction));

    // Outputs
    this.userPoolId = userPool.userPoolId;
    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.apiUrl = api.url;
  }
}

module.exports = { ApiStack };
