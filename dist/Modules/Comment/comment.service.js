"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/Models/post.model");
const post_repository_1 = require("../../DB/reposetories/post.repository");
const User_model_1 = require("../../DB/Models/User.model");
const user_repository_1 = require("../../DB/reposetories/user.repository");
const comment_model_1 = require("../../DB/Models/comment.model");
const comment_repository_1 = require("../../DB/reposetories/comment.repository");
const error_response_1 = require("../../Utils/response/error.response");
const post_service_1 = require("../Post/post.service");
const s3_config_1 = require("../../Utils/multer/s3.config");
class CommentService {
    _postModel = new post_repository_1.PostRepository(post_model_1.PostModel);
    _userModel = new user_repository_1.UserRepository(User_model_1.UserModel);
    _commentModel = new comment_repository_1.CommentRepository(comment_model_1.CommentModel);
    constructor() { }
    createComment = async (req, res) => {
        const { postId } = req.params;
        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                allowComments: post_model_1.AllowCommentsEnum.ALLOW,
                $or: (0, post_service_1.postAvilability)(req),
            },
        });
        if (!post)
            throw new error_response_1.NotFoundException('Post Not Found');
        if (req.body.tags?.length &&
            (await this._userModel.find({
                filter: { _id: { $in: req.body.tags } }
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException('Some Mentioned User Does Not Exist');
        }
        let attachments = [];
        if (req.files?.length) {
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assetPostFolderId}`
            });
        }
        const [comment] = (await this._commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    createdBy: req.user?._id
                }
            ]
        })) || [];
        if (!comment) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException('Fail To Create Comment');
        }
        return res.status(200).json({ message: ' Comment Created Successfully' });
    };
    createReply = async (req, res) => {
        const { postId, commentId } = req.params;
        const comment = await this._commentModel.findOne({
            filter: {
                _id: commentId,
                postId: postId,
            },
            options: {
                populate: [{ path: 'postId', match: {
                            allowComments: post_model_1.AllowCommentsEnum.ALLOW,
                            $or: (0, post_service_1.postAvilability)(req),
                        } }]
            }
        });
        if (!comment?.postId)
            throw new error_response_1.NotFoundException('Fail To Match Results');
        if (req.body.tags?.length &&
            (await this._userModel.find({
                filter: { _id: { $in: req.body.tags } }
            })).length !== req.body.tags.length) {
            throw new error_response_1.NotFoundException('Some Mentioned User Does Not Exist');
        }
        let attachments = [];
        if (req.files?.length) {
            const post = comment.postId;
            attachments = await (0, s3_config_1.uploadFiles)({
                files: req.files,
                path: `users/${post.createdBy}/post/${post.assetPostFolderId}`
            });
        }
        const [reply] = (await this._commentModel.create({
            data: [
                {
                    ...req.body,
                    attachments,
                    postId,
                    commentId,
                    createdBy: req.user?._id
                }
            ]
        })) || [];
        if (!reply) {
            if (attachments.length) {
                await (0, s3_config_1.deleteFiles)({ urls: attachments });
            }
            throw new error_response_1.BadRequestException('Fail To Create Reply');
        }
        return res.status(200).json({ message: ' Reply Created Successfully', reply });
    };
}
exports.default = new CommentService;
