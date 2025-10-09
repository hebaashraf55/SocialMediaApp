import z from 'zod';
import { generalField } from '../../Middlewares/validation.middleware';
import { fileValidation } from '../../Utils/multer/cluod.multer';



export const createCommentSchema = {
    params : z.strictObject({
        postId : z.string(),
    }),
    body : z.strictObject({
        content : z.string().min(3).max(500000).optional(),
        attachments : z.array(generalField.file(fileValidation.images)).max(3).optional(),
        tags : z.array(generalField.id).max(10).optional(),
    }).superRefine( (data, ctx) => {
        if (!data.attachments?.length && !data.content){
            ctx.addIssue({
                code : "custom",
                path : ["content"],
                message : "Please provided content or attachments"
            })
        }
        if ( data.tags?.length && data.tags.length !== [...new Set(data.tags)].length){
            ctx.addIssue({
                code : "custom",
                path : ["tags"],
                message : "Tags Provide unique tags"
            })
        }
    })
}

export const createReplySchema  = {
    params : createCommentSchema.params.extend({
        commentId : generalField.id,
    }),
    body : createCommentSchema.body,
}