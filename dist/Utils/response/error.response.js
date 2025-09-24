"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.ForbiddenException = exports.UnAuthorizedException = exports.NotFoundException = exports.BadRequestException = exports.ConfilectException = exports.ApplicationException = void 0;
class ApplicationException extends Error {
    statusCode;
    constructor(message, statusCode, options) {
        super(message, options);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApplicationException = ApplicationException;
class ConfilectException extends ApplicationException {
    constructor(message, options) {
        super(message, 409, options);
    }
}
exports.ConfilectException = ConfilectException;
class BadRequestException extends ApplicationException {
    constructor(message, options) {
        super(message, 400, options);
    }
}
exports.BadRequestException = BadRequestException;
class NotFoundException extends ApplicationException {
    constructor(message, options) {
        super(message, 404, options);
    }
}
exports.NotFoundException = NotFoundException;
class UnAuthorizedException extends ApplicationException {
    constructor(message, options) {
        super(message, 401, options);
    }
}
exports.UnAuthorizedException = UnAuthorizedException;
class ForbiddenException extends ApplicationException {
    constructor(message, options) {
        super(message, 403, options);
    }
}
exports.ForbiddenException = ForbiddenException;
const globalErrorHandler = (err, req, res, next) => {
    return res.status(err.statusCode || 500).json({
        message: err.message || "Something went wrong",
        stack: process.env.MODE === 'DEV' ? err.stack : undefined,
        cause: err.cause
    });
};
exports.globalErrorHandler = globalErrorHandler;
