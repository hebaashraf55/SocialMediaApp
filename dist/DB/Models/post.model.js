"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = exports.postSchema = exports.ActionEnum = exports.AvilabilityEnum = exports.AllowCommentsEnum = void 0;
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
var ActionEnum;
(function (ActionEnum) {
    ActionEnum["LIKE"] = "LIKE";
    ActionEnum["UNLIKE"] = "UNLIKE";
})(ActionEnum || (exports.ActionEnum = ActionEnum = {}));
exports.postSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 3,
        maxLength: 500000,
        required: function () {
            return !this.attachments?.length;
        }
    },
    attachments: [String],
    assetPostFolderId: String,
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
exports.postSchema.pre(['find', 'findOne', 'findOneAndUpdate', 'updateOne'], function (next) {
    const query = this.getQuery();
    if (query.paranoId === false) {
        this.setQuery({ ...query });
    }
    else {
        this.setQuery({ ...query, freezedAt: { $exists: false } });
    }
    next();
});
exports.PostModel = mongoose_1.models.Post || (0, mongoose_1.model)('Post', exports.postSchema);
