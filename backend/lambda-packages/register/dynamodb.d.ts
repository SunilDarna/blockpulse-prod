import { DynamoDB } from 'aws-sdk';
/**
 * Helper function to put an item in DynamoDB
 * @param item The item to put in the table
 * @returns The result of the put operation
 */
export declare const putItem: (item: any) => Promise<DynamoDB.DocumentClient.PutItemOutput>;
/**
 * Helper function to get an item from DynamoDB
 * @param key The key of the item to get
 * @returns The item if found, null otherwise
 */
export declare const getItem: (key: any) => Promise<any>;
/**
 * Helper function to query items from DynamoDB
 * @param params The query parameters
 * @returns The query result
 */
export declare const queryItems: (keyConditionExpression: string, expressionAttributeValues: any, indexName?: string) => Promise<DynamoDB.DocumentClient.QueryOutput>;
/**
 * Helper function to update an item in DynamoDB
 * @param key The key of the item to update
 * @param updateExpression The update expression
 * @param expressionAttributeValues The expression attribute values
 * @returns The result of the update operation
 */
export declare const updateItem: (key: any, updateExpression: string, expressionAttributeValues: any) => Promise<DynamoDB.DocumentClient.UpdateItemOutput>;
/**
 * Helper function to delete an item from DynamoDB
 * @param key The key of the item to delete
 * @returns The result of the delete operation
 */
export declare const deleteItem: (key: any) => Promise<DynamoDB.DocumentClient.DeleteItemOutput>;
