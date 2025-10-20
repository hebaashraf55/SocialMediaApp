"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = exports.chatSchema = exports.messageSchema = void 0;
const mongoose_1 = require("mongoose");
exports.messageSchema = new mongoose_1.Schema({
    content: {
        type: String,
        minLength: 2,
        maxLength: 500000,
        required: true
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true, });
exports.chatSchema = new mongoose_1.Schema({
    participants: [{ type: mongoose_1.Schema.Types.ObjectId, required: true, ref: 'User' }],
    messages: [exports.messageSchema],
    group: String,
    groupImage: String,
    roomId: { type: String, required: function () { return this.roomId; } },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: Date,
    updatedAt: Date
}, { timestamps: true, });
exports.ChatModel = mongoose_1.models.Chat || (0, mongoose_1.model)('Chat', exports.chatSchema);
