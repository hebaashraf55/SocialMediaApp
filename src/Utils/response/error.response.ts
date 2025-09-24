import type { Request, Response, NextFunction } from 'express';

export interface IError extends Error {
    statusCode: number;
}

export class ApplicationException extends Error {
    constructor(message: string, 
        public statusCode: number , 
        options?: ErrorOptions) {
        super(message, options);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor); // safty check
    }
}
export class ConfilectException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 409, options);
    }
}
export class BadRequestException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 400, options);
    }
}
export class NotFoundException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 404, options);
    }
}
export class UnAuthorizedException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 401, options);
    }
}
export class ForbiddenException extends ApplicationException {
    constructor(message: string, options?: ErrorOptions) {
        super(message, 403, options);
    }
}

export const globalErrorHandler = 
(err: IError, req : Request, res: Response, next: NextFunction) => {
        return res.status(err.statusCode || 500).json({
            message: err.message || "Something went wrong",
            stack : process.env.MODE === 'DEV' ? err.stack : undefined,
            cause : err.cause
        })
    }