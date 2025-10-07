import z from 'zod';
import { AvilabilityEnum, AllowCommentsEnum, ActionEnum } from '../../DB/Models/post.model';
import { generalField } from '../../Middlewares/validation.middleware';
import { fileValidation } from '../../Utils/multer/cluod.multer';


export const createPostSchema = {
    body : z.strictObject({
        content : z.string().min(3).max(500000).optional(),
        attachments : z.array(generalField.file(fileValidation.images)).max(3).optional(),
        avilability : z.enum(AvilabilityEnum).default(AvilabilityEnum.PUPLIC),
        allowComments : z.enum(AllowCommentsEnum).default(AllowCommentsEnum.ALLOW),
        tags : z.array(generalField.id).max(10).optional(),
        
    }).superRefine( (data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code : "custom",
                path : ["content"],
                message : "Please provided content or attachments"
            })
        }
        if( data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
            ctx.addIssue({
                code : "custom",
                path : ["tags"],
                message : "Tags Provide unique tags"
            })
        }
    })
}

export const updatePostSchema = {
    params : z.strictObject({
        postId : generalField.id
    }),
    body : z.strictObject({
        content : z.string().min(3).max(500000).optional(),
        attachments : z.array(generalField.file(fileValidation.images)).max(3).optional(),
        avilability : z.enum(AvilabilityEnum).default(AvilabilityEnum.PUPLIC),
        allowComments : z.enum(AllowCommentsEnum).default(AllowCommentsEnum.ALLOW),
        tags : z.array(generalField.id).max(10).optional(),
        removedTags : z.array(generalField.id).max(10).optional(),
        removedAttachments : z.array(z.string()).max(10).optional(),
        
    }).superRefine( (data, ctx) => {
        if (!data.attachments?.length && !data.content) {
            ctx.addIssue({
                code : "custom",
                path : ["content"],
                message : "Please provided content or attachments"
            })
        }
        if( data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
            ctx.addIssue({
                code : "custom",
                path : ["tags"],
                message : "Tags Provide unique tags"
            })
        }
         if( data.removedTags?.length && data.removedTags.length !== [...new Set(data.tags)].length){
            ctx.addIssue({
                code : "custom",
                path : ["tags"],
                message : "Tags Provide unique Removed Tags"
            })
        }
    })
}


export const likeUnlikePostSchema = {
    params : z.strictObject({
        postId : generalField.id,

    }),
    query : z.strictObject({
        
        action : z.enum(ActionEnum).default(ActionEnum.LIKE),
    })
};