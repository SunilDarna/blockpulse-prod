"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteItem = exports.updateItem = exports.queryItems = exports.getItem = exports.putItem = void 0;
const aws_sdk_1 = require("aws-sdk");
// Initialize the DynamoDB client
const dynamoDb = new aws_sdk_1.DynamoDB.DocumentClient();
// Get the table name from environment variables
const TABLE_NAME = process.env.TABLE_NAME || '';
/**
 * Helper function to put an item in DynamoDB
 * @param item The item to put in the table
 * @returns The result of the put operation
 */
const putItem = async (item) => {
    const params = {
        TableName: TABLE_NAME,
        Item: item,
    };
    try {
        return await dynamoDb.put(params).promise();
    }
    catch (error) {
        console.error('Error putting item in DynamoDB:', error);
        throw error;
    }
};
exports.putItem = putItem;
/**
 * Helper function to get an item from DynamoDB
 * @param key The key of the item to get
 * @returns The item if found, null otherwise
 */
const getItem = async (key) => {
    const params = {
        TableName: TABLE_NAME,
        Key: key,
    };
    try {
        const result = await dynamoDb.get(params).promise();
        return result.Item;
    }
    catch (error) {
        console.error('Error getting item from DynamoDB:', error);
        throw error;
    }
};
exports.getItem = getItem;
/**
 * Helper function to query items from DynamoDB
 * @param params The query parameters
 * @returns The query result
 */
const queryItems = async (keyConditionExpression, expressionAttributeValues, indexName) => {
    const params = {
        TableName: TABLE_NAME,
        KeyConditionExpression: keyConditionExpression,
        ExpressionAttributeValues: expressionAttributeValues,
    };
    if (indexName) {
        params.IndexName = indexName;
    }
    try {
        return await dynamoDb.query(params).promise();
    }
    catch (error) {
        console.error('Error querying items from DynamoDB:', error);
        throw error;
    }
};
exports.queryItems = queryItems;
/**
 * Helper function to update an item in DynamoDB
 * @param key The key of the item to update
 * @param updateExpression The update expression
 * @param expressionAttributeValues The expression attribute values
 * @returns The result of the update operation
 */
const updateItem = async (key, updateExpression, expressionAttributeValues) => {
    const params = {
        TableName: TABLE_NAME,
        Key: key,
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };
    try {
        return await dynamoDb.update(params).promise();
    }
    catch (error) {
        console.error('Error updating item in DynamoDB:', error);
        throw error;
    }
};
exports.updateItem = updateItem;
/**
 * Helper function to delete an item from DynamoDB
 * @param key The key of the item to delete
 * @returns The result of the delete operation
 */
const deleteItem = async (key) => {
    const params = {
        TableName: TABLE_NAME,
        Key: key,
    };
    try {
        return await dynamoDb.delete(params).promise();
    }
    catch (error) {
        console.error('Error deleting item from DynamoDB:', error);
        throw error;
    }
};
exports.deleteItem = deleteItem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1vZGIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvZHluYW1vZGIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEscUNBQW1DO0FBRW5DLGlDQUFpQztBQUNqQyxNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFFL0MsZ0RBQWdEO0FBQ2hELE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsVUFBVSxJQUFJLEVBQUUsQ0FBQztBQUVoRDs7OztHQUlHO0FBQ0ksTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQVMsRUFBa0QsRUFBRTtJQUN6RixNQUFNLE1BQU0sR0FBeUM7UUFDbkQsU0FBUyxFQUFFLFVBQVU7UUFDckIsSUFBSSxFQUFFLElBQUk7S0FDWCxDQUFDO0lBRUYsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUMsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLGlDQUFpQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3hELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQztBQVpXLFFBQUEsT0FBTyxXQVlsQjtBQUVGOzs7O0dBSUc7QUFDSSxNQUFNLE9BQU8sR0FBRyxLQUFLLEVBQUUsR0FBUSxFQUFnQixFQUFFO0lBQ3RELE1BQU0sTUFBTSxHQUF5QztRQUNuRCxTQUFTLEVBQUUsVUFBVTtRQUNyQixHQUFHLEVBQUUsR0FBRztLQUNULENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxNQUFNLE1BQU0sR0FBRyxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDcEQsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxtQ0FBbUMsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMxRCxNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDLENBQUM7QUFiVyxRQUFBLE9BQU8sV0FhbEI7QUFFRjs7OztHQUlHO0FBQ0ksTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUM3QixzQkFBOEIsRUFDOUIseUJBQThCLEVBQzlCLFNBQWtCLEVBQzRCLEVBQUU7SUFDaEQsTUFBTSxNQUFNLEdBQXVDO1FBQ2pELFNBQVMsRUFBRSxVQUFVO1FBQ3JCLHNCQUFzQixFQUFFLHNCQUFzQjtRQUM5Qyx5QkFBeUIsRUFBRSx5QkFBeUI7S0FDckQsQ0FBQztJQUVGLElBQUksU0FBUyxFQUFFLENBQUM7UUFDZCxNQUFNLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztJQUMvQixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0gsT0FBTyxNQUFNLFFBQVEsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDaEQsQ0FBQztJQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7UUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLHFDQUFxQyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQzVELE1BQU0sS0FBSyxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUMsQ0FBQztBQXJCVyxRQUFBLFVBQVUsY0FxQnJCO0FBRUY7Ozs7OztHQU1HO0FBQ0ksTUFBTSxVQUFVLEdBQUcsS0FBSyxFQUM3QixHQUFRLEVBQ1IsZ0JBQXdCLEVBQ3hCLHlCQUE4QixFQUNxQixFQUFFO0lBQ3JELE1BQU0sTUFBTSxHQUE0QztRQUN0RCxTQUFTLEVBQUUsVUFBVTtRQUNyQixHQUFHLEVBQUUsR0FBRztRQUNSLGdCQUFnQixFQUFFLGdCQUFnQjtRQUNsQyx5QkFBeUIsRUFBRSx5QkFBeUI7UUFDcEQsWUFBWSxFQUFFLGFBQWE7S0FDNUIsQ0FBQztJQUVGLElBQUksQ0FBQztRQUNILE9BQU8sTUFBTSxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pELENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6RCxNQUFNLEtBQUssQ0FBQztJQUNkLENBQUM7QUFDSCxDQUFDLENBQUM7QUFuQlcsUUFBQSxVQUFVLGNBbUJyQjtBQUVGOzs7O0dBSUc7QUFDSSxNQUFNLFVBQVUsR0FBRyxLQUFLLEVBQUUsR0FBUSxFQUFxRCxFQUFFO0lBQzlGLE1BQU0sTUFBTSxHQUE0QztRQUN0RCxTQUFTLEVBQUUsVUFBVTtRQUNyQixHQUFHLEVBQUUsR0FBRztLQUNULENBQUM7SUFFRixJQUFJLENBQUM7UUFDSCxPQUFPLE1BQU0sUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNqRCxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsb0NBQW9DLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDM0QsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBWlcsUUFBQSxVQUFVLGNBWXJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRHluYW1vREIgfSBmcm9tICdhd3Mtc2RrJztcblxuLy8gSW5pdGlhbGl6ZSB0aGUgRHluYW1vREIgY2xpZW50XG5jb25zdCBkeW5hbW9EYiA9IG5ldyBEeW5hbW9EQi5Eb2N1bWVudENsaWVudCgpO1xuXG4vLyBHZXQgdGhlIHRhYmxlIG5hbWUgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZXNcbmNvbnN0IFRBQkxFX05BTUUgPSBwcm9jZXNzLmVudi5UQUJMRV9OQU1FIHx8ICcnO1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBwdXQgYW4gaXRlbSBpbiBEeW5hbW9EQlxuICogQHBhcmFtIGl0ZW0gVGhlIGl0ZW0gdG8gcHV0IGluIHRoZSB0YWJsZVxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgcHV0IG9wZXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgcHV0SXRlbSA9IGFzeW5jIChpdGVtOiBhbnkpOiBQcm9taXNlPER5bmFtb0RCLkRvY3VtZW50Q2xpZW50LlB1dEl0ZW1PdXRwdXQ+ID0+IHtcbiAgY29uc3QgcGFyYW1zOiBEeW5hbW9EQi5Eb2N1bWVudENsaWVudC5QdXRJdGVtSW5wdXQgPSB7XG4gICAgVGFibGVOYW1lOiBUQUJMRV9OQU1FLFxuICAgIEl0ZW06IGl0ZW0sXG4gIH07XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZHluYW1vRGIucHV0KHBhcmFtcykucHJvbWlzZSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIHB1dHRpbmcgaXRlbSBpbiBEeW5hbW9EQjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIGdldCBhbiBpdGVtIGZyb20gRHluYW1vREJcbiAqIEBwYXJhbSBrZXkgVGhlIGtleSBvZiB0aGUgaXRlbSB0byBnZXRcbiAqIEByZXR1cm5zIFRoZSBpdGVtIGlmIGZvdW5kLCBudWxsIG90aGVyd2lzZVxuICovXG5leHBvcnQgY29uc3QgZ2V0SXRlbSA9IGFzeW5jIChrZXk6IGFueSk6IFByb21pc2U8YW55PiA9PiB7XG4gIGNvbnN0IHBhcmFtczogRHluYW1vREIuRG9jdW1lbnRDbGllbnQuR2V0SXRlbUlucHV0ID0ge1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcbiAgICBLZXk6IGtleSxcbiAgfTtcblxuICB0cnkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RiLmdldChwYXJhbXMpLnByb21pc2UoKTtcbiAgICByZXR1cm4gcmVzdWx0Lkl0ZW07XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgZ2V0dGluZyBpdGVtIGZyb20gRHluYW1vREI6JywgZXJyb3IpO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59O1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBxdWVyeSBpdGVtcyBmcm9tIER5bmFtb0RCXG4gKiBAcGFyYW0gcGFyYW1zIFRoZSBxdWVyeSBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyBUaGUgcXVlcnkgcmVzdWx0XG4gKi9cbmV4cG9ydCBjb25zdCBxdWVyeUl0ZW1zID0gYXN5bmMgKFxuICBrZXlDb25kaXRpb25FeHByZXNzaW9uOiBzdHJpbmcsXG4gIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGFueSxcbiAgaW5kZXhOYW1lPzogc3RyaW5nXG4pOiBQcm9taXNlPER5bmFtb0RCLkRvY3VtZW50Q2xpZW50LlF1ZXJ5T3V0cHV0PiA9PiB7XG4gIGNvbnN0IHBhcmFtczogRHluYW1vREIuRG9jdW1lbnRDbGllbnQuUXVlcnlJbnB1dCA9IHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXG4gICAgS2V5Q29uZGl0aW9uRXhwcmVzc2lvbjoga2V5Q29uZGl0aW9uRXhwcmVzc2lvbixcbiAgICBFeHByZXNzaW9uQXR0cmlidXRlVmFsdWVzOiBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzLFxuICB9O1xuXG4gIGlmIChpbmRleE5hbWUpIHtcbiAgICBwYXJhbXMuSW5kZXhOYW1lID0gaW5kZXhOYW1lO1xuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZHluYW1vRGIucXVlcnkocGFyYW1zKS5wcm9taXNlKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgY29uc29sZS5lcnJvcignRXJyb3IgcXVlcnlpbmcgaXRlbXMgZnJvbSBEeW5hbW9EQjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHVwZGF0ZSBhbiBpdGVtIGluIER5bmFtb0RCXG4gKiBAcGFyYW0ga2V5IFRoZSBrZXkgb2YgdGhlIGl0ZW0gdG8gdXBkYXRlXG4gKiBAcGFyYW0gdXBkYXRlRXhwcmVzc2lvbiBUaGUgdXBkYXRlIGV4cHJlc3Npb25cbiAqIEBwYXJhbSBleHByZXNzaW9uQXR0cmlidXRlVmFsdWVzIFRoZSBleHByZXNzaW9uIGF0dHJpYnV0ZSB2YWx1ZXNcbiAqIEByZXR1cm5zIFRoZSByZXN1bHQgb2YgdGhlIHVwZGF0ZSBvcGVyYXRpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHVwZGF0ZUl0ZW0gPSBhc3luYyAoXG4gIGtleTogYW55LFxuICB1cGRhdGVFeHByZXNzaW9uOiBzdHJpbmcsXG4gIGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGFueVxuKTogUHJvbWlzZTxEeW5hbW9EQi5Eb2N1bWVudENsaWVudC5VcGRhdGVJdGVtT3V0cHV0PiA9PiB7XG4gIGNvbnN0IHBhcmFtczogRHluYW1vREIuRG9jdW1lbnRDbGllbnQuVXBkYXRlSXRlbUlucHV0ID0ge1xuICAgIFRhYmxlTmFtZTogVEFCTEVfTkFNRSxcbiAgICBLZXk6IGtleSxcbiAgICBVcGRhdGVFeHByZXNzaW9uOiB1cGRhdGVFeHByZXNzaW9uLFxuICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXMsXG4gICAgUmV0dXJuVmFsdWVzOiAnVVBEQVRFRF9ORVcnLFxuICB9O1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIGF3YWl0IGR5bmFtb0RiLnVwZGF0ZShwYXJhbXMpLnByb21pc2UoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBjb25zb2xlLmVycm9yKCdFcnJvciB1cGRhdGluZyBpdGVtIGluIER5bmFtb0RCOicsIGVycm9yKTtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gZGVsZXRlIGFuIGl0ZW0gZnJvbSBEeW5hbW9EQlxuICogQHBhcmFtIGtleSBUaGUga2V5IG9mIHRoZSBpdGVtIHRvIGRlbGV0ZVxuICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgZGVsZXRlIG9wZXJhdGlvblxuICovXG5leHBvcnQgY29uc3QgZGVsZXRlSXRlbSA9IGFzeW5jIChrZXk6IGFueSk6IFByb21pc2U8RHluYW1vREIuRG9jdW1lbnRDbGllbnQuRGVsZXRlSXRlbU91dHB1dD4gPT4ge1xuICBjb25zdCBwYXJhbXM6IER5bmFtb0RCLkRvY3VtZW50Q2xpZW50LkRlbGV0ZUl0ZW1JbnB1dCA9IHtcbiAgICBUYWJsZU5hbWU6IFRBQkxFX05BTUUsXG4gICAgS2V5OiBrZXksXG4gIH07XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gYXdhaXQgZHluYW1vRGIuZGVsZXRlKHBhcmFtcykucHJvbWlzZSgpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGRlbGV0aW5nIGl0ZW0gZnJvbSBEeW5hbW9EQjonLCBlcnJvcik7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG4iXX0=