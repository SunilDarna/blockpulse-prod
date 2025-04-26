/**
 * Lambda function to create a new community
 * 
 * @author Amazon Q
 * @version 1.0.0
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Handler function to create a new community
 * 
 * @param {Object} event - API Gateway event
 * @param {Object} context - Lambda context
 * @returns {Object} HTTP response with created community data
 */
exports.handler = async (event, context) => {
    try {
        // Parse request body
        const requestBody = JSON.parse(event.body);
        
        // Validate required fields
        if (!requestBody.name) {
            return {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify({ message: 'Community name is required' })
            };
        }
        
        // Get user ID from Cognito authorizer
        const userId = event.requestContext.authorizer.claims.sub;
        const userEmail = event.requestContext.authorizer.claims.email;
        const userName = event.requestContext.authorizer.claims.name || userEmail.split('@')[0];
        
        // Create a new community
        const timestamp = new Date().toISOString();
        const communityId = uuidv4();
        
        const community = {
            id: communityId,
            name: requestBody.name,
            description: requestBody.description || '',
            createdAt: timestamp,
            updatedAt: timestamp,
            createdBy: userId,
            members: [
                {
                    userId: userId,
                    email: userEmail,
                    name: userName,
                    role: 'admin',
                    joinedAt: timestamp,
                    status: 'active'
                }
            ],
            membershipType: requestBody.membershipType || 'invite-only',
            isPublic: requestBody.isPublic || false
        };
        
        // Save to DynamoDB
        await dynamoDB.put({
            TableName: process.env.COMMUNITIES_TABLE,
            Item: community
        }).promise();
        
        // Create a membership record for the GSI
        await dynamoDB.put({
            TableName: process.env.COMMUNITIES_TABLE,
            Item: {
                id: `membership-${communityId}-${userId}`,
                userId: userId,
                communityId: communityId,
                role: 'admin',
                joinedAt: timestamp,
                status: 'active'
            }
        }).promise();
        
        return {
            statusCode: 201,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify(community)
        };
    } catch (error) {
        console.error('Error creating community:', error);
        
        return {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ 
                message: 'Error creating community',
                error: error.message
            })
        };
    }
};
