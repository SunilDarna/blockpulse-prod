import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

export class BlockPulseStack extends cdk.Stack {
  // Public properties to expose resources to other parts of the application
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly identityPool: cognito.CfnIdentityPool;
  public readonly authenticatedRole: iam.Role;
  public readonly unauthenticatedRole: iam.Role;
  public readonly blockPulseTable: dynamodb.Table;
  public readonly blockPulseBucket: s3.Bucket;

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
    this.blockPulseBucket = new s3.Bucket(this, 'BlockPulseBucket', {
      bucketName: `blockpulse-${envName}-${this.account}-${this.region}`,
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
  }
}
