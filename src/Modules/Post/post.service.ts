import { Request, Response, NextFunction } from "express"
import { PostModel } from "../../DB/Models/post.model";
import { PostRepository } from "../../DB/reposetories/post.repository";
import { UserModel } from "../../DB/Models/User.model";
import { UserRepository } from "../../DB/reposetories/user.repository";


class PostService {
    constructor(){}
    private _userRepository = new UserRepository(UserModel)
    private _postModel = new PostRepository(PostModel)

    createPost = async (req : Request,res: Response, next: NextFunction) => {
        return res.status(201).json({message : ' Post created successfully'})
    }
}

export default new PostService();