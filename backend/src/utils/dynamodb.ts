import { DynamoDB } from 'aws-sdk';

// Initialize the DynamoDB client
const dynamoDb = new DynamoDB.DocumentClient();

// Get the table name from environment variables
const TABLE_NAME = process.env.TABLE_NAME || '';

/**
 * Helper function to put an item in DynamoDB
 * @param item The item to put in the table
 * @returns The result of the put operation
 */
export const putItem = async (item: any): Promise<DynamoDB.DocumentClient.PutItemOutput> => {
  const params: DynamoDB.DocumentClient.PutItemInput = {
    TableName: TABLE_NAME,
    Item: item,
  };

  try {
    return await dynamoDb.put(params).promise();
  } catch (error) {
    console.error('Error putting item in DynamoDB:', error);
    throw error;
  }
};

/**
 * Helper function to get an item from DynamoDB
 * @param key The key of the item to get
 * @returns The item if found, null otherwise
 */
export const getItem = async (key: any): Promise<any> => {
  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: TABLE_NAME,
    Key: key,
  };

  try {
    const result = await dynamoDb.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting item from DynamoDB:', error);
    throw error;
  }
};

/**
 * Helper function to query items from DynamoDB
 * @param params The query parameters
 * @returns The query result
 */
export const queryItems = async (
  keyConditionExpression: string,
  expressionAttributeValues: any,
  indexName?: string
): Promise<DynamoDB.DocumentClient.QueryOutput> => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TABLE_NAME,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  };

  if (indexName) {
    params.IndexName = indexName;
  }

  try {
    return await dynamoDb.query(params).promise();
  } catch (error) {
    console.error('Error querying items from DynamoDB:', error);
    throw error;
  }
};

/**
 * Helper function to update an item in DynamoDB
 * @param key The key of the item to update
 * @param updateExpression The update expression
 * @param expressionAttributeValues The expression attribute values
 * @returns The result of the update operation
 */
export const updateItem = async (
  key: any,
  updateExpression: string,
  expressionAttributeValues: any
): Promise<DynamoDB.DocumentClient.UpdateItemOutput> => {
  const params: DynamoDB.DocumentClient.UpdateItemInput = {
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'UPDATED_NEW',
  };

  try {
    return await dynamoDb.update(params).promise();
  } catch (error) {
    console.error('Error updating item in DynamoDB:', error);
    throw error;
  }
};

/**
 * Helper function to delete an item from DynamoDB
 * @param key The key of the item to delete
 * @returns The result of the delete operation
 */
export const deleteItem = async (key: any): Promise<DynamoDB.DocumentClient.DeleteItemOutput> => {
  const params: DynamoDB.DocumentClient.DeleteItemInput = {
    TableName: TABLE_NAME,
    Key: key,
  };

  try {
    return await dynamoDb.delete(params).promise();
  } catch (error) {
    console.error('Error deleting item from DynamoDB:', error);
    throw error;
  }
};
