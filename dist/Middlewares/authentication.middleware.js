"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authentication = void 0;
const error_response_1 = require("../Utils/response/error.response");
const token_1 = require("../Utils/security/token");
const authentication = () => {
    return async (req, res, next) => {
        if (!req.headers.authorization) {
            throw new error_response_1.BadRequestException("Missing Authorization Header");
        }
        const { decoded, user } = await (0, token_1.decodeToken)({ authorization: req.headers.authorization });
        req.user = user;
        req.decoded = decoded;
        next();
    };
};
exports.authentication = authentication;
