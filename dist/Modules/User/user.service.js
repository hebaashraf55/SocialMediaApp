"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const token_1 = require("../../Utils/security/token");
const User_model_1 = require("../../DB/Models/User.model");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const friend_repository_1 = require("../../DB/reposetories/friend.repository");
const friendRequest_model_1 = require("../../DB/Models/friendRequest.model");
const error_response_1 = require("../../Utils/response/error.response");
class UserService {
    _userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    _friendModel = new friend_repository_1.FriendRepository(friendRequest_model_1.FriendModel);
    constructor() { }
    getProfile = async (req, res, next) => {
        return res.status(200).json({ message: ' Done', user: req.user, decoded: req.decoded });
    };
    logOut = async (req, res) => {
        const { flag } = req.body;
        let statusCode = 200;
        const update = {};
        switch (flag) {
            case token_1.logOutEnum.all:
                update.changeCridentialsTime = new Date();
                break;
            case token_1.logOutEnum.only:
                await (0, token_1.createRevokeToken)(req.decoded);
                statusCode = 201;
                break;
            default:
                break;
        }
        await this._userModel.updateOne({ filter: { _id: req.decoded?._id }, update });
        return res.status(statusCode).json({ message: ' Done' });
    };
    refreshToken = async (req, res) => {
        const credentials = await (0, token_1.createLoginCredentials)(req.user);
        await (0, token_1.createRevokeToken)(req.decoded);
        return res.status(201).json({ message: ' Done', data: credentials });
    };
    friendRequest = async (req, res) => {
        const { userId } = req.params;
        const checkFrienRequestExists = await this._friendModel.findOne({
            filter: {
                createdBy: { $in: [req.user?._id, userId] },
                sentTo: { $in: [req.user?._id, userId] },
            }
        });
        if (checkFrienRequestExists)
            throw new Error('Friend Request Already Sent');
        const user = await this._userModel.findOne({
            filter: {
                _id: userId
            }
        });
        if (!user)
            throw new error_response_1.NotFoundException('User Not Found');
        const [friend] = await this._friendModel.create({
            data: [
                {
                    createdBy: req.user?._id,
                    sendTo: userId
                }
            ]
        }) || [];
        if (!friend)
            throw new error_response_1.BadRequestException('Friend Request Not Sent');
        return res.status(200).json({ message: ' Done', data: friend });
    };
    acceptFriend = async (req, res) => {
        const { requestId } = req.params;
        const checkFrienRequestExists = await this._friendModel.findOneAndUpdate({
            filter: {
                _id: requestId,
                sendTo: req.user?._id,
                acceptedAt: { $exists: false }
            },
            update: {
                acceptedAt: new Date(),
            }
        });
        if (!checkFrienRequestExists)
            throw new error_response_1.ConfilectException('Fail Tp Accept Friend Request');
        await Promise.all([
            await this._userModel.updateOne({
                filter: {
                    _id: checkFrienRequestExists.createdBy,
                },
                update: {
                    $addToSet: {
                        friends: checkFrienRequestExists.sendTo
                    }
                }
            }),
            await this._userModel.updateOne({
                filter: {
                    _id: checkFrienRequestExists.sendTo,
                },
                update: {
                    $addToSet: {
                        friends: checkFrienRequestExists.createdBy
                    }
                }
            })
        ]);
        return res.status(200).json({ message: ' Done' });
    };
}
exports.default = new UserService;
