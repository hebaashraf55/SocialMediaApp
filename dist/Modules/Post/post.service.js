"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_model_1 = require("../../DB/Models/post.model");
const post_repository_1 = require("../../DB/reposetories/post.repository");
const User_model_1 = require("../../DB/Models/User.model");
const user_repository_1 = require("../../DB/reposetories/user.repository");
class PostService {
    constructor() { }
    _userRepository = new user_repository_1.UserRepository(User_model_1.UserModel);
    _postModel = new post_repository_1.PostRepository(post_model_1.PostModel);
    createPost = async (req, res, next) => {
        return res.status(201).json({ message: ' Post created successfully' });
    };
}
exports.default = new PostService();
