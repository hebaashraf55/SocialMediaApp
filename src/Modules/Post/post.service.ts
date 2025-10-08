import { Request, Response, NextFunction } from "express"
import { ActionEnum, AvilabilityEnum, PostModel } from "../../DB/Models/post.model";
import { PostRepository } from "../../DB/reposetories/post.repository";
import { HUserDocument, UserModel } from "../../DB/Models/User.model";
import { UserRepository } from "../../DB/reposetories/user.repository";
import { BadRequestException, NotFoundException } from "../../Utils/response/error.response";
import { deleteFiles, uploadFiles } from "../../Utils/multer/s3.config";
import { v4 as uuid } from 'uuid';
import { LikePostQueryDTO } from "./post.dto";
import { Types, UpdateQuery } from "mongoose";


export const postAvilability = (req : Request ) => {
    return [
        {avilability : AvilabilityEnum.PUPLIC }, 
        { avilability : AvilabilityEnum.ONLYME, createdBy : req.user?._id },
        { 
         avilability : AvilabilityEnum.FRIENDS, 
         createdBy : { $in : [...(req.user?.friends || []), req.user?._id] }, 
         'likes._id' : req.user?._id 
        },
        { avilability : AvilabilityEnum.ONLYME, tags: { $in : req.user?.id } }

    ]
}



class PostService {

    private _userModel = new UserRepository(UserModel)
    private _postModel = new PostRepository(PostModel)

    constructor(){}


    createPost = async (req : Request,res: Response, next: NextFunction) => {
        if (
            req.body.tags?.length && 
            (await this._userModel.find({ filter : { _id : { $in : req.body.tags} }})).length !== req.body.tags.length
        ) {
            throw new NotFoundException('Some Mentioned User Does Not Exist')
        }
        let attachments : string[] = [];
        let assetPostFolderId = uuid(); // unique id

        if (req.files?.length) {  
            
            attachments = await uploadFiles({

                files : req.files as Express.Multer.File[],
                path: `users/${req.user?._id}/post/${assetPostFolderId}`
            })
        }
        const [post] = (await this._postModel.create({ 
            data : [
                {
            ...req.body,
            attachments,
            assetPostFolderId,
            createdBy : req.user?._id
            }
    ]
    })) || [];

        if(!post) {
            if(attachments.length){
                await deleteFiles({ urls : attachments })
            }
            throw new BadRequestException('Fail To Create Post')
        }


        return res.status(201).json({message : ' Post created successfully', post})
    }

    likeUnlikePost = async (req : Request,res: Response, next: NextFunction) => {
        
        const { postId } = req.params as unknown as { postId : string }
        const { action } = req.query as LikePostQueryDTO
        
        let update : UpdateQuery<HUserDocument> = {
            $addToSet : {likes : { _id : req.user?._id } },
        }
        if(action === ActionEnum.UNLIKE) {
            update = { $pull : { likes : req.user?._id } }
        }
        const post = await this._postModel.findOneAndUpdate({
            filter : {
                 _id : postId, 
                $or :  postAvilability(req) 
            },
            update ,
          });
          if(!post) {
            throw new NotFoundException('Post Does Not Exist')
          }


        return res.status(200).json({message : ' Done', post})
    }

    updatePost = async (req : Request,res: Response, next: NextFunction) => {

        const { postId } = req.params as unknown as { postId : string }

        const post = await this._postModel.findOne({
            filter : { _id : postId, createdBy : req.user?._id },
        })

        if ( !post ) throw new NotFoundException('Post Does Not Exist')

        if (
            req.body.tags?.length && 
            (await this._userModel.find({ filter : { _id : { $in : req.body.tags} }})).length !== req.body.tags.length
        ) {
            throw new NotFoundException('Some Mentioned User Does Not Exist')
        }

        let attachments : string[] = [];

        if (req.files?.length) {  
            attachments = await uploadFiles({
                
                files : req.files as Express.Multer.File[],
                path: `users/${post.createdBy}/post/${post.assetPostFolderId}`
            })
        }
        // update post // aggregation pipline [{},{}]
        const updatedPost = await this._postModel.updateOne({
            filter : { _id : postId },
            update : [ 
                { 
                $set : { 
                        content : req.body.content,
                        allowComments : req.body.allowComments || post.allowComments,
                        avilability : req.body.avilability || post.avilability,
                        attachments : {
                            $setUnion : [
                                { 
                                    $setDifference : [
                                        '$attachments', 
                                        req.body.removedAttachments || []
                                    ]
                                }, attachments 
                            ]
                           },
                        tags : {
                            $setUnion : [
                                {  
                                    $setDifference : [ '$tags', 
                                        (req.body.removedTags || [])
                                        .map((tag:string) => { return Types.ObjectId.createFromHexString(tag)}) ]
                                }, 
                                (req.body.tags || [])
                                .map((tag:string) => { return Types.ObjectId.createFromHexString(tag) })
                             ]
                        }, 
                } 
            } ]
        })

        if(!updatedPost.modifiedCount){
            if(attachments.length){
                await deleteFiles({ urls : attachments })
            }
             throw new BadRequestException('Fail To Update Post')
        }  else {
                if(req.body.removedAttachments?.length){
                    await deleteFiles({ urls : req.body.removedAttachments })
                }
            }

        return res.status(200).json({message : ' Done'})
    }

    getPosts = async (req : Request,res: Response, next: NextFunction) => {
        let { page , size } = req.query as unknown as { page : number, size : number}
        const posts = await this._postModel.paginate({
            filter : {$or : postAvilability(req)},
            page,
            size
        })
        
        return res.status(200).json({ message : ' Done', posts })
    }

}

export default new PostService();