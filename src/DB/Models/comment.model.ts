import { model, Types, Schema, models, HydratedDocument } from 'mongoose';
import { IPost } from './post.model';



export interface IComment{ 
    content ?: string,
    attachments ?: string[],

    tags ?: Types.ObjectId[],
    likes ?: Types.ObjectId[],

    createdBy : Types.ObjectId,
    postId : Types.ObjectId | Partial<IPost>,
    commentId ?: Types.ObjectId,

    freezedBy ?: Types.ObjectId,
    freezedAt ?: Date,

    restoredBy ?: Types.ObjectId,
    restoredAt ?: Date,

    createdAt : Date,
    updatedAt ?: Date

}
export const commentSchema = new Schema<IComment>({
    content : { 
        type : String, 
        minLength : 3, 
        maxLength : 500000, 
        required : function(){
        return !this.attachments?.length
    } } ,
    attachments : [String],
    
    tags : [ { type : Schema.Types.ObjectId, ref : 'User' } ],
    likes : [ { type : Schema.Types.ObjectId, ref : 'User' } ],

    createdBy : { 
        type : Schema.Types.ObjectId,
        required : true, 
        ref : 'User' },

    postId : { 
        type : Schema.Types.ObjectId , 
        required : true, 
        ref : 'Post' 
    },
    commentId : { 
        type : Schema.Types.ObjectId, 
        ref : 'Comment' 
    },

    freezedBy : { 
        type : Schema.Types.ObjectId, 
        ref : 'User' },
        
    freezedAt : Date,
    restoredBy : { type : Schema.Types.ObjectId, ref : 'User' },
    restoredAt : Date

}, {timestamps : true,});


commentSchema.pre(['find','findOne', 'findOneAndUpdate' , 'updateOne'], function(next){
    const query = this.getQuery()  
    if ( query.paranoId === false ) {
        this.setQuery({ ...query })
    } else {
        this.setQuery({ ...query, freezedAt : { $exists : false} })
    }
    next()
})




export const CommentModel = models.Comment || model<IComment>('Comment', commentSchema)

export type HCommentDocument = HydratedDocument<IComment>