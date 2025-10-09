import { Request, Response, NextFunction } from 'express';
import { AllowCommentsEnum, AvilabilityEnum, HPostDocument, PostModel } from '../../DB/Models/post.model';
import { PostRepository } from '../../DB/reposetories/post.repository';
import { UserModel } from '../../DB/Models/User.model';
import { UserRepository } from '../../DB/reposetories/user.repository';
import { CommentModel } from '../../DB/Models/comment.model';
import { CommentRepository } from '../../DB/reposetories/comment.repository';
import { BadRequestException, NotFoundException } from '../../Utils/response/error.response';
import { postAvilability } from '../Post/post.service';
import { deleteFiles, uploadFile, uploadFiles } from '../../Utils/multer/s3.config';
import { Types } from 'mongoose';


class CommentService {
    private _postModel = new PostRepository(PostModel)
    private _userModel = new UserRepository(UserModel)
    private _commentModel = new CommentRepository(CommentModel)

    constructor() {}


    createComment = async (req : Request, res : Response) => {

        const { postId } = req.params as unknown as { postId : string }

        const post = await this._postModel.findOne({
            filter : { 
                _id : postId,
                allowComments : AllowCommentsEnum.ALLOW,
                $or: postAvilability(req),
             },
         })
        if(!post) throw new NotFoundException('Post Not Found')

        if(req.body.tags?.length && 
            (await this._userModel.find({ 
                filter : { _id : { $in : req.body.tags} }
            })).length !== req.body.tags.length
        ){
            throw new NotFoundException('Some Mentioned User Does Not Exist')
        }
        let attachments : string[] = [];
        if(req.files?.length){
            attachments = await uploadFiles({
                files : req.files as Express.Multer.File[],
                path : `users/${post.createdBy}/post/${post.assetPostFolderId}`
            })
        }
        const [ comment ] = (await this._commentModel.create({ 
            data : [
                {
            ...req.body,
            attachments,
            postId,
            createdBy : req.user?._id
            }
    ]
    })) || [];

        if(!comment) {
            if(attachments.length){
                await deleteFiles({ urls : attachments })
            }
            throw new BadRequestException('Fail To Create Comment')
        }
        
        return res.status(200).json({message : ' Comment Created Successfully'})
    }


    createReply = async (req : Request, res : Response) => {

        const { postId, commentId } = req.params as unknown as 
        { 
          postId : Types.ObjectId, 
          commentId : Types.ObjectId
         }

        const comment = await this._commentModel.findOne({
            filter : { 
                _id : commentId,
                postId : postId,
             },
             options : {
                populate : [ { path : 'postId' , match : {
                    allowComments : AllowCommentsEnum.ALLOW,
                    $or: postAvilability(req),
                } } ]
             }
         })
        if( !comment?.postId ) throw new NotFoundException('Fail To Match Results')

        if(req.body.tags?.length && 
            (await this._userModel.find({ 
                filter : { _id : { $in : req.body.tags} }
            })).length !== req.body.tags.length
        ){
            throw new NotFoundException('Some Mentioned User Does Not Exist')
        }
        let attachments : string[] = [];

        if(req.files?.length){

            const post = comment.postId as Partial<HPostDocument>
            attachments = await uploadFiles({
                files : req.files as Express.Multer.File[],
                path : `users/${post.createdBy}/post/${post.assetPostFolderId}`
            })
        }
        const [ reply ] = (await this._commentModel.create({ 
            data : [
                {
            ...req.body,
            attachments,
            postId,
            commentId,
            createdBy : req.user?._id
            }
    ]
    })) || [];

        if(!reply) {
            if(attachments.length){
                await deleteFiles({ urls : attachments })
            }
            throw new BadRequestException('Fail To Create Reply')
        }
        
        return res.status(200).json({message : ' Reply Created Successfully', reply})
    }


}


export default new CommentService;