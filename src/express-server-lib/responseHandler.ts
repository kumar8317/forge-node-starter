import { Response } from 'express';
import { SuccessCodes } from './declarations';

// Status Codes For Responses
export const OK_STATUS_CODE = 200;
export const CREATED_STATUS_CODE = 201;
export const ACCEPTED_STATUS_CODE = 202;
export const NO_CONTENT_STATUS_CODE = 204;
export const BAD_REQUEST_STATUS_CODE = 400;
export const UNAUTHORIZED_STATUS_CODE = 401;
export const NOT_FOUND_STATUS_CODE = 404;
export const SERVER_ERROR_STATUS_CODE = 500;
export const BAD_GATEWAY_STATUS_CODE = 502;
export const SERVICE_UNAVAILABLE_STATUS_CODE = 503;

/**
 * Handle error responses send to the client
 * @param error Generated errors
 * @param res Express response object
 * sends response as {success: false, message: 'Some Message'}
 */
export const handleErrorResponse = (
    error: Error | { status: number; message: string; },
    res: Response,
): void => {
    if (error instanceof Error) {
        res.status(SERVER_ERROR_STATUS_CODE).send({ success: false, message: 'Some error occurred. Please try again after some time.' });
    } else if (error.status) {
        res.status(error.status).send({ success: false, message: error.message });
    } else {
        res.status(BAD_REQUEST_STATUS_CODE).send({ success: false, message: 'Some error occurred. Please try again after some time.' });
    }
};

/**
 * Send success response along with data to the client
 * sends response as {success: true, data: any}
 * @param data Data object
 * @param res Express response object
 * @param statusCode Success status code. Default 200
 */
export const sendDataResponse = (
    data: unknown, res: Response, statusCode: SuccessCodes = OK_STATUS_CODE,
): void => {
    res.status(statusCode).send({ success: true, data });
};

/**
 * Handle error responses send to the client
 * sends response as { message: 'Some Message'}
 * @param error Generated errors
 * @param res Express response objec
 */
export const forwardErrorResponse = (
    error: Error | { status: number; message: string; },
    res: Response,
): void => {
    if (error instanceof Error) {
        res.status(SERVER_ERROR_STATUS_CODE).send({ message: 'Some error occurred. Please try again after some time.' });
    } else if (error.status) {
        res.status(error.status).send({ message: error.message });
    } else {
        res.status(BAD_REQUEST_STATUS_CODE).send({ message: 'Some error occurred. Please try again after some time.' });
    }
};

/**
 * Send success response along with data to the client
 * sends data directly in the response
 * @param data Data object
 * @param res Express response object
 * @param statusCode Success status code. Default 200
 */
export const forwardDataResponse = (
    data: unknown, res: Response, statusCode: SuccessCodes = OK_STATUS_CODE,
): void => {
    res.status(statusCode).send(data);
};
