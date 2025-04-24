/**
 * Helper function to create a standardized API response
 * @param statusCode HTTP status code
 * @param body Response body
 * @returns API Gateway response object
 */
export declare const createResponse: (statusCode: number, body: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Credentials': boolean;
    };
    body: string;
};
/**
 * Helper function to create a success response
 * @param data Response data
 * @returns API Gateway success response
 */
export declare const successResponse: (data: any) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Credentials': boolean;
    };
    body: string;
};
/**
 * Helper function to create an error response
 * @param statusCode HTTP status code
 * @param message Error message
 * @returns API Gateway error response
 */
export declare const errorResponse: (statusCode: number, message: string) => {
    statusCode: number;
    headers: {
        'Content-Type': string;
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Credentials': boolean;
    };
    body: string;
};
