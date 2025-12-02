import { StatusCodeErrorDto } from "../../../apps/server/src/utils/constants";
import type { ServerErrorDto } from "../types/constants";
import { ErrorHandler } from "./handleError";

export class HTTPError extends Error {
    data?: any;
    statusCode: number;

    constructor(message: string, statusCode: StatusCodeErrorDto, data?: any) {
        super(message);
        this.name = 'HTTPError';
        this.statusCode = Number.parseInt(statusCode);
        this.data = data;
        // Important: restore prototype chain
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}

export class HTTPErrorMessage extends Error {
    data: any;
    statusCode: number;

    constructor(message: string, statusCode: StatusCodeErrorDto) {
        super(message);
        this.name = 'HTTPErrorMessage';
        this.statusCode = Number.parseInt(statusCode);
        // Important: restore prototype chain
        Object.setPrototypeOf(this, HTTPError.prototype);
    }
}

export const getHTTPError = (error: ServerErrorDto) => {
    const message = ErrorHandler.getErrorMessage(error);
    if (error instanceof HTTPError) {
        const statusCode = (error.statusCode.toString() || '400') as StatusCodeErrorDto;
        throw new HTTPError(message, statusCode);
    }
    throw new HTTPError(message, '400');
}