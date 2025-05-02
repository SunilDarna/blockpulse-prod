// AWS Configuration
const config = {
  // Cognito
  cognito: {
    REGION: 'us-east-1',
    USER_POOL_ID: 'us-east-1_jnC202YPi',
    APP_CLIENT_ID: '57b85raqi80idfomik8goqg3nv',
    IDENTITY_POOL_ID: 'us-east-1:1156d4fd-69e2-4abe-b962-5a62bb86bf2c',
  },
  // API Gateway - Updated to use the actual API Gateway endpoint
  apiGateway: {
    REGION: 'us-east-1',
    URL: 'https://rwe79ec7og.execute-api.us-east-1.amazonaws.com/v1', // Production API endpoint
  },
  // WebSocket API - Updated to use the actual API Gateway endpoint
  webSocket: {
    REGION: 'us-east-1',
    URL: 'wss://rwe79ec7og.execute-api.us-east-1.amazonaws.com/v1', // Production WebSocket endpoint
  }
};

export default config;
