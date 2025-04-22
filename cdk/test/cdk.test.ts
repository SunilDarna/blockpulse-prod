import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BlockPulseStack } from '../lib/cdk-stack';

describe('BlockPulseStack', () => {
  test('Stack creates expected outputs', () => {
    // GIVEN
    const app = new cdk.App();
    
    // WHEN
    const stack = new BlockPulseStack(app, 'MyTestStack');
    
    // THEN
    const template = Template.fromStack(stack);
    
    // Verify stack has the expected output
    template.hasOutput('StackName', {});
  });
});
