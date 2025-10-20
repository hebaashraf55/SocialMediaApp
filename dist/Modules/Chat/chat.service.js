"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const mongoose_1 = require("mongoose");
const chat_model_1 = require("../../DB/Models/chat.model");
const User_model_1 = require("../../DB/Models/User.model");
const chat_repository_1 = require("../../DB/reposetories/chat.repository");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const error_response_1 = require("../../Utils/response/error.response");
const uuid_1 = require("uuid");
class ChatService {
    _chatmodel = new chat_repository_1.ChatRepository(chat_model_1.ChatModel);
    _usermodel = new user_repository_1.UserRepository(User_model_1.UserModel);
    constructor() { }
    getChat = async (req, res) => {
        const { userId } = req.params;
        const chat = await this._chatmodel.findOne({
            filter: {
                participants: {
                    $all: [
                        req.user?._id,
                        mongoose_1.Types.ObjectId.createFromHexString(userId)
                    ]
                },
                group: { $exists: false }
            },
            options: { populate: 'participants' }
        });
        if (!chat)
            throw new error_response_1.NotFoundException('Chat Not Found');
        return res.status(200).json({ message: 'Done', data: { chat } });
    };
    getGroupChat = async (req, res) => {
        const { groupId } = req.params;
        const chat = await this._chatmodel.findOne({
            filter: {
                _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                group: { $exists: true },
                participants: { $in: [req.user?._id] }
            },
            options: { populate: "messages.createdBy" }
        });
        if (!chat)
            throw new error_response_1.BadRequestException('Fail To Find Chat');
        return res.status(200).json({ message: 'Done', data: { chat } });
    };
    createGroupChat = async (req, res) => {
        const { participants, group } = req.body;
        const dbParticipants = participants.map((participant) => {
            return mongoose_1.Types.ObjectId.createFromHexString(participant);
        });
        const users = await this._usermodel.find({
            filter: {
                _id: { $in: dbParticipants },
                friends: { $in: [req.user?._id] }
            }
        });
        if (dbParticipants.length != users.length)
            throw new error_response_1.BadRequestException('Please Provide Valid dbParticipants');
        const roomId = (0, uuid_1.v4)();
        const [newGroup] = await this._chatmodel.create({
            data: [{
                    createdBy: req.user?._id,
                    group,
                    roomId,
                    participants: [...dbParticipants, req.user?._id]
                }]
        }) || [];
        if (!newGroup)
            throw new error_response_1.BadRequestException('Fail to create group chat');
        return res.status(200).json({ message: 'Done', data: { newGroup } });
    };
    sayHi = ({ message, socket, callback, io }) => {
        try {
            console.log(message);
            callback ? callback("I Recived Your Message") : undefined;
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendMessage = async ({ content, sendTo, socket, io }) => {
        try {
            const createdBy = socket.criedentials?.user._id;
            const user = await this._usermodel.findOne({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(sendTo),
                    friends: { $in: [createdBy] }
                }
            });
            if (!user)
                throw new error_response_1.NotFoundException('User Not Found');
            const chat = await this._chatmodel.findOneAndUpdate({
                filter: {
                    participants: {
                        $all: [
                            createdBy,
                            mongoose_1.Types.ObjectId.createFromHexString(sendTo)
                        ]
                    },
                    group: { $exists: false }
                },
                update: {
                    $addToSet: {
                        message: {
                            content,
                            createdBy
                        }
                    }
                }
            });
            if (!chat) {
                const [newChat] = await this._chatmodel.create({
                    data: [{
                            createdBy,
                            messages: [{ content, createdBy }],
                            participants: [createdBy, mongoose_1.Types.ObjectId.createFromHexString(sendTo)]
                        }]
                }) || [];
                if (!newChat)
                    throw new error_response_1.BadRequestException('Fail to Create Chat');
            }
            io?.emit('successMessage', { content });
            io?.emit('newMessage', { content, from: socket.criedentials?.user });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    joinRoom = async ({ roomId, socket, io }) => {
        try {
            const chat = await this._chatmodel.findOne({
                filter: {
                    roomId,
                    participants: { $in: socket.criedentials?.user._id },
                    group: { $exists: true }
                }
            });
            if (!chat)
                throw new error_response_1.NotFoundException('Fail To Join Room');
            socket.join(chat.roomId);
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
    sendGroupMessage = async ({ content, groupId, socket, io }) => {
        try {
            const createdBy = socket.criedentials?.user?._id;
            const chat = await this._chatmodel.findOneAndUpdate({
                filter: {
                    _id: mongoose_1.Types.ObjectId.createFromHexString(groupId),
                    participants: { $in: [createdBy] },
                    group: { $exists: true }
                },
                update: {
                    $addToSet: {
                        messages: {
                            content,
                            createdBy
                        }
                    }
                }
            });
            if (!chat)
                throw new error_response_1.NotFoundException('Chat Not Found');
            io?.emit('successMessage', { content });
        }
        catch (error) {
            socket.emit("custom_error", error);
        }
    };
}
exports.ChatService = ChatService;
exports.default = new ChatService();
