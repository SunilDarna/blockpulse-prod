"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = exports.successResponse = exports.createResponse = void 0;
/**
 * Helper function to create a standardized API response
 * @param statusCode HTTP status code
 * @param body Response body
 * @returns API Gateway response object
 */
const createResponse = (statusCode, body) => {
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
exports.createResponse = createResponse;
/**
 * Helper function to create a success response
 * @param data Response data
 * @returns API Gateway success response
 */
const successResponse = (data) => {
    return (0, exports.createResponse)(200, {
        success: true,
        data,
    });
};
exports.successResponse = successResponse;
/**
 * Helper function to create an error response
 * @param statusCode HTTP status code
 * @param message Error message
 * @returns API Gateway error response
 */
const errorResponse = (statusCode, message) => {
    return (0, exports.createResponse)(statusCode, {
        success: false,
        error: message,
    });
};
exports.errorResponse = errorResponse;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVzcG9uc2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdXRpbHMvcmVzcG9uc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7O0dBS0c7QUFDSSxNQUFNLGNBQWMsR0FBRyxDQUFDLFVBQWtCLEVBQUUsSUFBUyxFQUFFLEVBQUU7SUFDOUQsT0FBTztRQUNMLFVBQVU7UUFDVixPQUFPLEVBQUU7WUFDUCxjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLDZCQUE2QixFQUFFLEdBQUc7WUFDbEMsa0NBQWtDLEVBQUUsSUFBSTtTQUN6QztRQUNELElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQztLQUMzQixDQUFDO0FBQ0osQ0FBQyxDQUFDO0FBVlcsUUFBQSxjQUFjLGtCQVV6QjtBQUVGOzs7O0dBSUc7QUFDSSxNQUFNLGVBQWUsR0FBRyxDQUFDLElBQVMsRUFBRSxFQUFFO0lBQzNDLE9BQU8sSUFBQSxzQkFBYyxFQUFDLEdBQUcsRUFBRTtRQUN6QixPQUFPLEVBQUUsSUFBSTtRQUNiLElBQUk7S0FDTCxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFMVyxRQUFBLGVBQWUsbUJBSzFCO0FBRUY7Ozs7O0dBS0c7QUFDSSxNQUFNLGFBQWEsR0FBRyxDQUFDLFVBQWtCLEVBQUUsT0FBZSxFQUFFLEVBQUU7SUFDbkUsT0FBTyxJQUFBLHNCQUFjLEVBQUMsVUFBVSxFQUFFO1FBQ2hDLE9BQU8sRUFBRSxLQUFLO1FBQ2QsS0FBSyxFQUFFLE9BQU87S0FDZixDQUFDLENBQUM7QUFDTCxDQUFDLENBQUM7QUFMVyxRQUFBLGFBQWEsaUJBS3hCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGEgc3RhbmRhcmRpemVkIEFQSSByZXNwb25zZVxuICogQHBhcmFtIHN0YXR1c0NvZGUgSFRUUCBzdGF0dXMgY29kZVxuICogQHBhcmFtIGJvZHkgUmVzcG9uc2UgYm9keVxuICogQHJldHVybnMgQVBJIEdhdGV3YXkgcmVzcG9uc2Ugb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVSZXNwb25zZSA9IChzdGF0dXNDb2RlOiBudW1iZXIsIGJvZHk6IGFueSkgPT4ge1xuICByZXR1cm4ge1xuICAgIHN0YXR1c0NvZGUsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICAgIH0sXG4gICAgYm9keTogSlNPTi5zdHJpbmdpZnkoYm9keSksXG4gIH07XG59O1xuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0byBjcmVhdGUgYSBzdWNjZXNzIHJlc3BvbnNlXG4gKiBAcGFyYW0gZGF0YSBSZXNwb25zZSBkYXRhXG4gKiBAcmV0dXJucyBBUEkgR2F0ZXdheSBzdWNjZXNzIHJlc3BvbnNlXG4gKi9cbmV4cG9ydCBjb25zdCBzdWNjZXNzUmVzcG9uc2UgPSAoZGF0YTogYW55KSA9PiB7XG4gIHJldHVybiBjcmVhdGVSZXNwb25zZSgyMDAsIHtcbiAgICBzdWNjZXNzOiB0cnVlLFxuICAgIGRhdGEsXG4gIH0pO1xufTtcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdG8gY3JlYXRlIGFuIGVycm9yIHJlc3BvbnNlXG4gKiBAcGFyYW0gc3RhdHVzQ29kZSBIVFRQIHN0YXR1cyBjb2RlXG4gKiBAcGFyYW0gbWVzc2FnZSBFcnJvciBtZXNzYWdlXG4gKiBAcmV0dXJucyBBUEkgR2F0ZXdheSBlcnJvciByZXNwb25zZVxuICovXG5leHBvcnQgY29uc3QgZXJyb3JSZXNwb25zZSA9IChzdGF0dXNDb2RlOiBudW1iZXIsIG1lc3NhZ2U6IHN0cmluZykgPT4ge1xuICByZXR1cm4gY3JlYXRlUmVzcG9uc2Uoc3RhdHVzQ29kZSwge1xuICAgIHN1Y2Nlc3M6IGZhbHNlLFxuICAgIGVycm9yOiBtZXNzYWdlLFxuICB9KTtcbn07XG4iXX0=