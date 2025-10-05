"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.postSchema = exports.AvilabilityEnum = exports.AllowCommentsEnum = void 0;
const mongoose_1 = require("mongoose");
var AllowCommentsEnum;
(function (AllowCommentsEnum) {
    AllowCommentsEnum["ALLOW"] = "ALLOW";
    AllowCommentsEnum["DENY"] = "DENY";
})(AllowCommentsEnum || (exports.AllowCommentsEnum = AllowCommentsEnum = {}));
var AvilabilityEnum;
(function (AvilabilityEnum) {
    AvilabilityEnum["PUPLIC"] = "PUPLIC";
    AvilabilityEnum["FRIENDS"] = "FRIENDS";
    AvilabilityEnum["ONLYME"] = "ONLYME";
})(AvilabilityEnum || (exports.AvilabilityEnum = AvilabilityEnum = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 3,
        maxLength: 500000,
        required: function () {
            return !this.attachment?.length;
        }
    },
    attachment: [String],
    allowComments: {
        type: String,
        enum: Object.values(AllowCommentsEnum),
        default: AllowCommentsEnum.ALLOW
    },
    avilability: {
        type: String,
        enum: Object.values(AvilabilityEnum),
        default: AvilabilityEnum.PUPLIC
    },
    tags: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    likes: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    freezedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    freezedAt: Date,
    restoredBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    restoredAt: Date
}, { timestamps: true, });
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)('Post', exports.postSchema);
