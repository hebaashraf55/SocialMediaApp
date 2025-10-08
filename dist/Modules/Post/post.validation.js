"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.likeUnlikePostSchema = exports.updatePostSchema = exports.createPostSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const post_model_1 = require("../../DB/Models/post.model");
const validation_middleware_1 = require("../../Middlewares/validation.middleware");
const cluod_multer_1 = require("../../Utils/multer/cluod.multer");
exports.createPostSchema = {
    body: zod_1.default.strictObject({
        content: zod_1.default.string().min(3).max(500000).optional(),
        attachments: zod_1.default.array(validation_middleware_1.generalField.file(cluod_multer_1.fileValidation.images)).max(3).optional(),
        avilability: zod_1.default.enum(post_model_1.AvilabilityEnum).default(post_model_1.AvilabilityEnum.PUPLIC),
        allowComments: zod_1.default.enum(post_model_1.AllowCommentsEnum).default(post_model_1.AllowCommentsEnum.ALLOW),
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
exports.updatePostSchema = {
    params: zod_1.default.strictObject({
        postId: validation_middleware_1.generalField.id
    }),
    body: zod_1.default.strictObject({
        content: zod_1.default.string().min(3).max(500000).optional(),
        attachments: zod_1.default.array(validation_middleware_1.generalField.file(cluod_multer_1.fileValidation.images)).max(3).optional(),
        avilability: zod_1.default.enum(post_model_1.AvilabilityEnum).default(post_model_1.AvilabilityEnum.PUPLIC),
        allowComments: zod_1.default.enum(post_model_1.AllowCommentsEnum).default(post_model_1.AllowCommentsEnum.ALLOW),
        tags: zod_1.default.array(validation_middleware_1.generalField.id).max(10).optional(),
        removedTags: zod_1.default.array(validation_middleware_1.generalField.id).max(10).optional(),
        removedAttachments: zod_1.default.array(zod_1.default.string()).max(10).optional(),
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
        if (data.removedTags?.length && data.removedTags.length !== [...new Set(data.removedTags)].length) {
            ctx.addIssue({
                code: "custom",
                path: ["removedTags"],
                message: "Tags Provide unique Removed Tags"
            });
        }
    })
};
exports.likeUnlikePostSchema = {
    params: zod_1.default.strictObject({
        postId: validation_middleware_1.generalField.id,
    }),
    query: zod_1.default.strictObject({
        action: zod_1.default.enum(post_model_1.ActionEnum).default(post_model_1.ActionEnum.LIKE),
    })
};
