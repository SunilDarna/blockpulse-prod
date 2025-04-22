// AWS Configuration
const config = {
  // Cognito
  cognito: {
    REGION: 'us-east-1',
    USER_POOL_ID: 'us-east-1_jnC202YPi',
    APP_CLIENT_ID: '57b85raqi80idfomik8goqg3nv',
    IDENTITY_POOL_ID: 'us-east-1:1156d4fd-69e2-4abe-b962-5a62bb86bf2c',
  },
  // API Gateway
  apiGateway: {
    REGION: 'us-east-1',
    URL: 'https://blockpulse-api.anviinnovate.com/v1', // Production API endpoint
  },
  // WebSocket API
  webSocket: {
    REGION: 'us-east-1',
    URL: 'wss://blockpulse-ws.anviinnovate.com/v1', // Production WebSocket endpoint
  }
};

export default config;
