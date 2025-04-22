#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { BlockPulseStack } from '../lib/cdk-stack';

const app = new cdk.App();

// Create a stack for each environment
new BlockPulseStack(app, 'BlockPulseDevStack', {
  description: 'BlockPulse Development Stack',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  },
  tags: {
    Environment: 'dev',
    Project: 'BlockPulse'
  }
});

// Production stack will be deployed to us-east-1 as specified in the requirements
new BlockPulseStack(app, 'BlockPulseProdStack', {
  description: 'BlockPulse Production Stack',
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'us-east-1'
  },
  tags: {
    Environment: 'prod',
    Project: 'BlockPulse'
  }
});