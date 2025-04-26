/**
 * Lambda function to retrieve communities for the authenticated user
 * 
 * @author Amazon Q
 * @version 1.0.0
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Handler function to get communities for the authenticated user
 * 
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} HTTP response with communities data
 */
exports.handler = async (event, context) => {
    try {
        // Get user ID from Cognito authorizer
        const userId = event.requestContext.authorizer.claims.sub;
        
        if (!userId) {
            return {
                statusCode: 401,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({ message: 'User not authenticated' })
            };
        }
        
        // Query communities where the user is a member
        const params = {
            TableName: process.env.COMMUNITIES_TABLE,
            IndexName: 'MembershipIndex',
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        };
        
        const result = await dynamoDB.query(params).promise();
        
        // Return the communities
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                communities: result.Items || []
            })
        };
    } catch (error) {
        console.error('Error retrieving user communities:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ 
                message: 'Error retrieving communities',
                error: error.message
            })
        };
    }
};
