/**
 * Helper function to create a standardized API response
 * @param statusCode HTTP status code
 * @param body Response body
 * @returns API Gateway response object
 */
export const createResponse = (statusCode: number, body: any) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(body),
  };
};

/**
 * Helper function to create a success response
 * @param data Response data
 * @returns API Gateway success response
 */
export const successResponse = (data: any) => {
  return createResponse(200, {
    success: true,
    data,
  });
};

/**
 * Helper function to create an error response
 * @param statusCode HTTP status code
 * @param message Error message
 * @returns API Gateway error response
 */
export const errorResponse = (statusCode: number, message: string) => {
  return createResponse(statusCode, {
    success: false,
    error: message,
  });
};
