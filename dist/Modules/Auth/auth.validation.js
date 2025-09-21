"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signUpSchema = exports.confirmeEmailSchema = exports.logInSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.logInSchema = {
    body: zod_1.default.strictObject({
        email: validation_middleware_1.generalField.email,
        password: validation_middleware_1.generalField.password,
    })
};
exports.confirmeEmailSchema = {
    body: zod_1.default.strictObject({
        email: validation_middleware_1.generalField.email,
        otp: validation_middleware_1.generalField.otp,
    })
};
exports.signUpSchema = {
    body: exports.logInSchema.body.extend({
        userName: validation_middleware_1.generalField.userName,
        confirmPassword: validation_middleware_1.generalField.confirmPassword
    }).superRefine((data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code: "custom",
                path: ["confirmPassword"],
                message: "Password and Confirm Password must be same"
            });
        }
    })
};
