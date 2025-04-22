import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class BlockPulseStack extends cdk.Stack {
  // Public properties to expose resources to other parts of the application
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly authenticatedRole: iam.Role;
  public readonly unauthenticatedRole: iam.Role;
  public readonly blockPulseTable: dynamodb.Table;
  public readonly blockPulseBucket: s3.Bucket;
  public readonly restApi: apigateway.RestApi;
  public readonly lambdaAuthorizer: apigateway.TokenAuthorizer;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Environment-specific configuration
    const isProd = id.includes('Prod');
    const envName = isProd ? 'prod' : 'dev';
    const domainPrefix = isProd ? 'blockpulse-prod' : 'blockpulse-dev';

    // T4: Cognito User Pool
    this.userPool = new cognito.UserPool(this, 'BlockPulseUserPool', {
      userPoolName: `BlockPulse-${envName}-UserPool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
        username: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: true,
        },
        familyName: {
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: false,
        },
      },
      customAttributes: {
        createdAt: new cognito.DateTimeAttribute(),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(7),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
    });

    // Add domain to the user pool
    const userPoolDomain = this.userPool.addDomain('BlockPulseUserPoolDomain', {
      cognitoDomain: {
        domainPrefix: domainPrefix,
      },
    });

    // Create User Pool Client
    this.userPoolClient = this.userPool.addClient('BlockPulseUserPoolClient', {
      userPoolClientName: `BlockPulse-${envName}-client`,
      generateSecret: false,
      authFlows: {
        userPassword: true,
        userSrp: true,
        adminUserPassword: true,
      },
      preventUserExistenceErrors: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
        callbackUrls: [
          isProd ? 'https://blockpulse.anviinnovate.com/callback' : 'http://localhost:3000/callback',
        ],
        logoutUrls: [
          isProd ? 'https://blockpulse.anviinnovate.com/' : 'http://localhost:3000/',
        ],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    // Create Identity Pool
    this.identityPool = new cognito.CfnIdentityPool(this, 'BlockPulseIdentityPool', {
      identityPoolName: `BlockPulse${envName}IdentityPool`,
      allowUnauthenticatedIdentities: true,
      cognitoIdentityProviders: [
        {
          clientId: this.userPoolClient.userPoolClientId,
          providerName: this.userPool.userPoolProviderName,
        },
      ],
    });

    // Create IAM roles for authenticated and unauthenticated users
    this.authenticatedRole = new iam.Role(this, 'BlockPulseAuthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role for authenticated BlockPulse users',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    this.unauthenticatedRole = new iam.Role(this, 'BlockPulseUnauthenticatedRole', {
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': this.identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'unauthenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity'
      ),
      description: 'Role for unauthenticated BlockPulse users',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
      ],
    });

    // Attach roles to Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(this, 'BlockPulseIdentityPoolRoleAttachment', {
      identityPoolId: this.identityPool.ref,
      roles: {
        authenticated: this.authenticatedRole.roleArn,
        unauthenticated: this.unauthenticatedRole.roleArn,
      },
    });

    // T5: DynamoDB Table
    this.blockPulseTable = new dynamodb.Table(this, 'BlockPulseTable', {
      tableName: `BlockPulse-${envName}-Table`,
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // On-demand capacity
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, // Enable point-in-time recovery
      encryption: dynamodb.TableEncryption.DEFAULT, // Use AWS owned CMK
      timeToLiveAttribute: 'TTL', // TTL attribute for expiring items
    });

    // Add Global Secondary Indexes for common access patterns
    
    // GSI1: For community lookups by name and type
    this.blockPulseTable.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: {
        name: 'GSI1PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI1SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2: For user lookups by email
    this.blockPulseTable.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: {
        name: 'GSI2PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI2SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI3: For time-based queries (announcements, messages)
    this.blockPulseTable.addGlobalSecondaryIndex({
      indexName: 'GSI3',
      partitionKey: {
        name: 'GSI3PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'GSI3SK',
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Grant the authenticated role access to the DynamoDB table
    this.blockPulseTable.grantReadWriteData(this.authenticatedRole);
    
    // T6: S3 Bucket for storing user content and community assets
    // Create S3 bucket with a unique logical ID to avoid conflicts
    const blockPulseBucketLogicalId = `BlockPulseBucket${envName.charAt(0).toUpperCase() + envName.slice(1)}`;
    
    // Create the S3 bucket directly without try-catch
    // Use a completely different bucket name pattern to avoid conflicts
    this.blockPulseBucket = new s3.Bucket(this, blockPulseBucketLogicalId, {
      // Using a unique name with timestamp to ensure uniqueness
      bucketName: `bp-${envName}-${Date.now().toString().substring(0, 10)}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // Block all public access
      encryption: s3.BucketEncryption.S3_MANAGED, // Use S3 managed encryption
      enforceSSL: true, // Enforce SSL for all requests
      versioned: isProd, // Enable versioning in production
      removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd, // Auto delete objects in non-prod environments
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
          ],
          allowedOrigins: isProd 
            ? ['https://blockpulse.anviinnovate.com'] 
            : ['http://localhost:3000'],
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          // Move infrequently accessed objects to Intelligent-Tiering after 30 days
          transitions: [
            {
              storageClass: s3.StorageClass.INTELLIGENT_TIERING,
              transitionAfter: cdk.Duration.days(30),
            },
          ],
          // Expire temporary objects after 90 days (only in non-prod)
          expiration: !isProd ? cdk.Duration.days(90) : undefined,
          prefix: 'temp/',
          enabled: true,
        },
      ],
    });
    
    // Grant the authenticated role access to the S3 bucket
    this.blockPulseBucket.grantReadWrite(this.authenticatedRole);
    
    // Output the stack name for reference
    new cdk.CfnOutput(this, 'StackName', {
      value: this.stackName,
      description: 'The name of the BlockPulse stack',
    });

    // Output Cognito User Pool ID
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      description: 'The ID of the Cognito User Pool',
      exportName: `${this.stackName}-UserPoolId`,
    });

    // Output Cognito User Pool Client ID
    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      description: 'The ID of the Cognito User Pool Client',
      exportName: `${this.stackName}-UserPoolClientId`,
    });

    // Output Cognito Identity Pool ID
    new cdk.CfnOutput(this, 'IdentityPoolId', {
      value: this.identityPool.ref,
      description: 'The ID of the Cognito Identity Pool',
      exportName: `${this.stackName}-IdentityPoolId`,
    });

    // Output Cognito User Pool Domain
    new cdk.CfnOutput(this, 'UserPoolDomain', {
      value: `${domainPrefix}.auth.${this.region}.amazoncognito.com`,
      description: 'The domain of the Cognito User Pool',
      exportName: `${this.stackName}-UserPoolDomain`,
    });

    // Output DynamoDB Table Name
    new cdk.CfnOutput(this, 'TableName', {
      value: this.blockPulseTable.tableName,
      description: 'The name of the DynamoDB table',
      exportName: `${this.stackName}-TableName`,
    });

    // Output DynamoDB Table ARN
    new cdk.CfnOutput(this, 'TableArn', {
      value: this.blockPulseTable.tableArn,
      description: 'The ARN of the DynamoDB table',
      exportName: `${this.stackName}-TableArn`,
    });
    
    // Output S3 Bucket Name
    new cdk.CfnOutput(this, 'BucketName', {
      value: this.blockPulseBucket.bucketName,
      description: 'The name of the S3 bucket',
      exportName: `${this.stackName}-BucketName`,
    });
    
    // Output S3 Bucket ARN
    new cdk.CfnOutput(this, 'BucketArn', {
      value: this.blockPulseBucket.bucketArn,
      description: 'The ARN of the S3 bucket',
      exportName: `${this.stackName}-BucketArn`,
    });

    // T7: REST API Gateway
    this.restApi = new apigateway.RestApi(this, 'BlockPulseApi', {
      restApiName: `BlockPulse-${envName}-API`,
      description: 'API for BlockPulse application',
      defaultCorsPreflightOptions: {
        allowOrigins: isProd 
          ? ['https://blockpulse.anviinnovate.com'] 
          : ['http://localhost:3000'],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
      },
      deployOptions: {
        stageName: 'v1',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: !isProd,
      },
    });

    // Create Lambda authorizer
    const authorizerLambda = new lambda.Function(this, 'LambdaAuthorizer', {
      functionName: `BlockPulse-${envName}-Authorizer`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/lambda-authorizer.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      timeout: cdk.Duration.seconds(10),
      memorySize: 256,
    });

    // Create Lambda authorizer for API Gateway
    this.lambdaAuthorizer = new apigateway.TokenAuthorizer(this, 'ApiAuthorizer', {
      handler: authorizerLambda,
      identitySource: 'method.request.header.Authorization',
      resultsCacheTtl: cdk.Duration.seconds(300), // Cache authorizer results for 5 minutes
    });

    // Create auth API resource
    const authApi = this.restApi.root.addResource('auth');

    // Create Lambda functions for authentication endpoints
    
    // Register Lambda
    const registerLambda = new lambda.Function(this, 'RegisterLambda', {
      functionName: `BlockPulse-${envName}-Register`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/register.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        TABLE_NAME: this.blockPulseTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the register Lambda
    this.blockPulseTable.grantWriteData(registerLambda);
    registerLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:SignUp'],
      resources: [this.userPool.userPoolArn],
    }));

    // Confirm Registration Lambda
    const confirmRegistrationLambda = new lambda.Function(this, 'ConfirmRegistrationLambda', {
      functionName: `BlockPulse-${envName}-ConfirmRegistration`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/confirm-registration.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        TABLE_NAME: this.blockPulseTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the confirm registration Lambda
    this.blockPulseTable.grantReadWriteData(confirmRegistrationLambda);
    confirmRegistrationLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ConfirmSignUp'],
      resources: [this.userPool.userPoolArn],
    }));

    // Login Lambda
    const loginLambda = new lambda.Function(this, 'LoginLambda', {
      functionName: `BlockPulse-${envName}-Login`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/login.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
        TABLE_NAME: this.blockPulseTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the login Lambda
    this.blockPulseTable.grantReadData(loginLambda);
    loginLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:InitiateAuth'],
      resources: [this.userPool.userPoolArn],
    }));

    // Forgot Password Lambda
    const forgotPasswordLambda = new lambda.Function(this, 'ForgotPasswordLambda', {
      functionName: `BlockPulse-${envName}-ForgotPassword`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/forgot-password.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the forgot password Lambda
    forgotPasswordLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ForgotPassword'],
      resources: [this.userPool.userPoolArn],
    }));

    // Confirm Forgot Password Lambda
    const confirmForgotPasswordLambda = new lambda.Function(this, 'ConfirmForgotPasswordLambda', {
      functionName: `BlockPulse-${envName}-ConfirmForgotPassword`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/confirm-forgot-password.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the confirm forgot password Lambda
    confirmForgotPasswordLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ConfirmForgotPassword'],
      resources: [this.userPool.userPoolArn],
    }));

    // Refresh Token Lambda
    const refreshTokenLambda = new lambda.Function(this, 'RefreshTokenLambda', {
      functionName: `BlockPulse-${envName}-RefreshToken`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/refresh-token.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the refresh token Lambda
    refreshTokenLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:InitiateAuth'],
      resources: [this.userPool.userPoolArn],
    }));

    // Logout Lambda
    const logoutLambda = new lambda.Function(this, 'LogoutLambda', {
      functionName: `BlockPulse-${envName}-Logout`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/logout.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the logout Lambda
    logoutLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:GlobalSignOut'],
      resources: [this.userPool.userPoolArn],
    }));

    // Resend Confirmation Lambda
    const resendConfirmationLambda = new lambda.Function(this, 'ResendConfirmationLambda', {
      functionName: `BlockPulse-${envName}-ResendConfirmation`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/resend-confirmation.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        USER_POOL_CLIENT_ID: this.userPoolClient.userPoolClientId,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the resend confirmation Lambda
    resendConfirmationLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:ResendConfirmationCode'],
      resources: [this.userPool.userPoolArn],
    }));

    // Get User Lambda
    const getUserLambda = new lambda.Function(this, 'GetUserLambda', {
      functionName: `BlockPulse-${envName}-GetUser`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'dist/auth/get-user.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend')),
      environment: {
        USER_POOL_ID: this.userPool.userPoolId,
        TABLE_NAME: this.blockPulseTable.tableName,
      },
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
    });
    
    // Grant permissions to the get user Lambda
    this.blockPulseTable.grantReadData(getUserLambda);
    getUserLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['cognito-idp:GetUser'],
      resources: ['*'], // GetUser operates on the access token, not the user pool
    }));

    // Create API endpoints for authentication
    
    // Register endpoint
    const registerResource = authApi.addResource('register');
    registerResource.addMethod('POST', new apigateway.LambdaIntegration(registerLambda));

    // Confirm registration endpoint
    const confirmResource = authApi.addResource('confirm');
    confirmResource.addMethod('POST', new apigateway.LambdaIntegration(confirmRegistrationLambda));

    // Login endpoint
    const loginResource = authApi.addResource('login');
    loginResource.addMethod('POST', new apigateway.LambdaIntegration(loginLambda));

    // Forgot password endpoint
    const forgotPasswordResource = authApi.addResource('forgot-password');
    forgotPasswordResource.addMethod('POST', new apigateway.LambdaIntegration(forgotPasswordLambda));

    // Confirm forgot password endpoint
    const confirmForgotPasswordResource = authApi.addResource('confirm-forgot-password');
    confirmForgotPasswordResource.addMethod('POST', new apigateway.LambdaIntegration(confirmForgotPasswordLambda));

    // Refresh token endpoint
    const refreshTokenResource = authApi.addResource('refresh-token');
    refreshTokenResource.addMethod('POST', new apigateway.LambdaIntegration(refreshTokenLambda));

    // Logout endpoint (requires authorization)
    const logoutResource = authApi.addResource('logout');
    logoutResource.addMethod('POST', new apigateway.LambdaIntegration(logoutLambda), {
      authorizer: this.lambdaAuthorizer,
    });

    // Resend confirmation endpoint
    const resendConfirmationResource = authApi.addResource('resend-confirmation');
    resendConfirmationResource.addMethod('POST', new apigateway.LambdaIntegration(resendConfirmationLambda));

    // Get user endpoint (requires authorization)
    const userResource = authApi.addResource('user');
    userResource.addMethod('GET', new apigateway.LambdaIntegration(getUserLambda), {
      authorizer: this.lambdaAuthorizer,
    });

    // Output API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.restApi.url,
      description: 'The URL of the API Gateway',
      exportName: `${this.stackName}-ApiUrl`,
    });
  }
}
