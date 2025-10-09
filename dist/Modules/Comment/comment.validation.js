"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReplySchema = exports.createCommentSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const cluod_multer_1 = require("../../Utils/multer/cluod.multer");
exports.createCommentSchema = {
    params: zod_1.default.strictObject({
        postId: zod_1.default.string(),
    }),
    body: zod_1.default.strictObject({
        content: zod_1.default.string().min(3).max(500000).optional(),
        attachments: zod_1.default.array(validation_middleware_1.generalField.file(cluod_multer_1.fileValidation.images)).max(3).optional(),
        tags: zod_1.default.array(validation_middleware_1.generalField.id).max(10).optional(),
    }).superRefine((data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code: "custom",
                path: ["content"],
                message: "Please provided content or attachments"
            });
        }
        if (data.tags?.length && data.tags.length !== [...new Set(data.tags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["tags"],
                message: "Tags Provide unique tags"
            });
        }
    })
};
exports.createReplySchema = {
    params: exports.createCommentSchema.params.extend({
        commentId: validation_middleware_1.generalField.id,
    }),
    body: exports.createCommentSchema.body,
};
