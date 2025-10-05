"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalField = exports.validation = void 0;
const error_response_1 = require("../Utils/response/error.response");
const zod_1 = __importDefault(require("zod"));
const mongoose_1 = require("mongoose");
const validation = (schema) => {
    return (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            if (!schema[key])
                continue;
            if (req.file) {
                req.body.attachments = req.file;
            }
            if (req.files) {
                req.body.attachments = req.files;
            }
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
    file: function (mimetype) {
        return zod_1.default.
            strictObject({
            fieldname: zod_1.default.string(),
            originalname: zod_1.default.string(),
            encoding: zod_1.default.string(),
            mimetype: zod_1.default.string(),
            buffer: zod_1.default.any().optional(),
            path: zod_1.default.string().optional(),
            size: zod_1.default.number(),
        })
            .refine((data) => { return data.buffer || data.path; }, { error: "Please provide a file" });
    },
    id: zod_1.default.string().refine((data) => {
        return mongoose_1.Types.ObjectId.isValid(data);
    }, { error: "Invalid Tag id" })
};
