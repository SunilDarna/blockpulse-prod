/**
 * Lambda function to retrieve a specific community by ID
 * 
 * @author Amazon Q
 * @version 1.0.0
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Handler function to get a community by its ID
 * 
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} HTTP response with community data
 */
exports.handler = async (event, context) => {
    try {
        // Get community ID from path parameters
        const communityId = event.pathParameters.communityId;
        
        if (!communityId) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({ message: 'Community ID is required' })
            };
        }
        
        // Get user ID from Cognito authorizer
        const userId = event.requestContext.authorizer.claims.sub;
        
        // Get the community from DynamoDB
        const params = {
            TableName: process.env.COMMUNITIES_TABLE,
            Key: {
                id: communityId
            }
        };
        
        const result = await dynamoDB.get(params).promise();
        
        if (!result.Item) {
            return {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({ message: 'Community not found' })
            };
        }
        
        // Check if user is a member of the community
        const isMember = result.Item.members && 
                         result.Item.members.some(member => member.userId === userId);
        
        if (!isMember) {
            return {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({ message: 'You are not a member of this community' })
            };
        }
        
        // Return the community
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(result.Item)
        };
    } catch (error) {
        console.error('Error retrieving community:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ 
                message: 'Error retrieving community',
                error: error.message
            })
        };
    }
};
