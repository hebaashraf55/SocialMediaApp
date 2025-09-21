"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalField = exports.validation = void 0;
const error_response_1 = require("../Utils/response/error.response");
const zod_1 = __importDefault(require("zod"));
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            const validationResults = schema[key].safeParse(req[key]);
            if (!validationResults.success) {
                const errors = validationResults.error;
                validationErrors.push({
                    key,
                    issues: errors.issues.map((issue) => {
                        return { message: issue.message, path: issue.path };
                    }),
                });
            }
            if (validationErrors.length > 0) {
                throw new error_response_1.BadRequestException('Validation Error', { cause: validationErrors });
            }
        }
        return next();
    };
};
exports.validation = validation;
exports.generalField = {
    userName: zod_1.default.string({ error: "Username must be string" }).min(3, {
        error: "Username must be at least 3 characters long"
    }).max(25, {
        error: "Username must be at most 25 characters long"
    }),
    email: zod_1.default.email({
        error: "Invalid email"
    }),
    password: zod_1.default.string({ error: "Password must be string" }),
    confirmPassword: zod_1.default.string({ error: "Confirm Password must be string" }),
    otp: zod_1.default.string().regex(/^\d{6}/),
};
