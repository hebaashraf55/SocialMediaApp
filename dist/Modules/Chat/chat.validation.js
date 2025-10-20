"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGroupChatSchema = exports.createGroupChatSchema = exports.getChatSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
exports.getChatSchema = {
    params: zod_1.default.strictObject({
        userId: validation_middleware_1.generalField.id,
    })
};
exports.createGroupChatSchema = {
    body: zod_1.default.strictObject({
        participants: zod_1.default.array(validation_middleware_1.generalField.id).min(1),
        group: zod_1.default.string().min(1).max(100),
    })
        .superRefine((data, ctx) => {
        if (data.participants?.length &&
            data.participants.length !== [...new Set(data.participants)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["participants"],
                message: "Tags Provide unique participants"
            });
        }
    })
};
exports.getGroupChatSchema = {
    params: zod_1.default.strictObject({
        groupId: validation_middleware_1.generalField.id
    })
};
