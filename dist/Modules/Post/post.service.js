"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postAvilability = void 0;
const post_model_1 = require("../../DB/Models/post.model");
const post_repository_1 = require("../../DB/reposetories/post.repository");
const User_model_1 = require("../../DB/Models/User.model");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const error_response_1 = require("../../Utils/response/error.response");
const s3_config_1 = require("../../Utils/multer/s3.config");
const uuid_1 = require("uuid");
const mongoose_1 = require("mongoose");
const postAvilability = (req) => {
    return [
        { avilability: post_model_1.AvilabilityEnum.PUPLIC },
        { avilability: post_model_1.AvilabilityEnum.ONLYME, createdBy: req.user?._id },
        {
            avilability: post_model_1.AvilabilityEnum.FRIENDS,
            createdBy: { $in: [...(req.user?.friends || []), req.user?._id] },
            'likes._id': req.user?._id
        },
        { avilability: post_model_1.AvilabilityEnum.ONLYME, tags: { $in: req.user?.id } }
    ];
};
exports.postAvilability = postAvilability;
class PostService {
    _userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    _postModel = new post_repository_1.PostRepository(post_model_1.PostModel);
    constructor() { }
    createPost = async (req, res, next) => {
        if (req.body.tags?.length &&
            (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException('Some Mentioned User Does Not Exist');
        }
        let attachments = [];
        let assetPostFolderId = (0, uuid_1.v4)();
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${req.user?._id}/post/${assetPostFolderId}`
            });
        }
        const [post] = (await this._postModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    assetPostFolderId,
                    createdBy: req.user?._id
                }
            ]
        })) || [];
        if (!post) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException('Fail To Create Post');
        }
        return res.status(201).json({ message: ' Post created successfully', post });
    };
    likeUnlikePost = async (req, res, next) => {
        const { postId } = req.params;
        const { action } = req.query;
        let update = {
            $addToSet: { likes: { _id: req.user?._id } },
        };
        if (action === post_model_1.ActionEnum.UNLIKE) {
            update = { $pull: { likes: req.user?._id } };
        }
        const post = await this._postModel.findOneAndUpdate({
            filter: {
                _id: postId,
                $or: (0, exports.postAvilability)(req)
            },
            update,
        });
        if (!post) {
            throw new error_response_1.NotFoundException('Post Does Not Exist');
        }
        return res.status(200).json({ message: ' Done', post });
    };
    updatePost = async (req, res, next) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: { _id: postId, createdBy: req.user?._id },
        });
        if (!post)
            throw new error_response_1.NotFoundException('Post Does Not Exist');
        if (req.body.tags?.length &&
            (await this._userModel.find({ filter: { _id: { $in: req.body.tags } } })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException('Some Mentioned User Does Not Exist');
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assetPostFolderId}`
            });
        }
        const updatedPost = await this._postModel.updateOne({
            filter: { _id: postId },
            update: [
                {
                    $set: {
                        content: req.body.content,
                        allowComments: req.body.allowComments || post.allowComments,
                        avilability: req.body.avilability || post.avilability,
                        attachments: {
                            $setUnion: [
                                {
                                    $setDifference: [
                                        '$attachments',
                                        req.body.removedAttachments || []
                                    ]
                                }, attachments
                            ]
                        },
                        tags: {
                            $setUnion: [
                                {
                                    $setDifference: ['$tags',
                                        (req.body.removedTags || [])
                                            .map((tag) => { return mongoose_1.Types.ObjectId.createFromHexString(tag); })]
                                },
                                (req.body.tags || [])
                                    .map((tag) => { return mongoose_1.Types.ObjectId.createFromHexString(tag); })
                            ]
                        },
                    }
                }
            ]
        });
        if (!updatedPost.modifiedCount) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException('Fail To Update Post');
        }
        else {
            if (req.body.removedAttachments?.length) {
                await (0, s3_config_1.deleteFiles)({ urls: req.body.removedAttachments });
            }
        }
        return res.status(200).json({ message: ' Done' });
    };
    getPosts = async (req, res, next) => {
        let { page, size } = req.query;
        const posts = await this._postModel.paginate({
            filter: { $or: (0, exports.postAvilability)(req) },
            page,
            size
        });
        return res.status(200).json({ message: ' Done', posts });
    };
}
exports.default = new PostService();
