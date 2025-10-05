import { model, Types, Schema, models, HydratedDocument } from 'mongoose';

export enum AllowCommentsEnum {
    ALLOW = 'ALLOW',
    DENY = 'DENY',
}
export enum AvilabilityEnum {
    PUPLIC = 'PUPLIC',
    FRIENDS = 'FRIENDS',
    ONLYME = 'ONLYME',
}

export interface IPost{ 
    content ?: string,
    attachment ?: string[],

    allowComments?: AllowCommentsEnum,
    avilability?: AvilabilityEnum,

    tags ?: Types.ObjectId[],
    likes ?: Types.ObjectId[],

    createdBy : Types.ObjectId,

    freezedBy ?: Types.ObjectId,
    freezedAt ?: Date,

    restoredBy ?: Types.ObjectId,
    restoredAt ?: Date,

    createdAt : Date,
    updatedAt ?: Date

}
export const postSchema = new Schema<IPost>({
    content : { 
        type : String, 
        minLength : 3, 
        maxLength : 500000, 
        required : function(){
        return !this.attachment?.length
    } } ,
    attachment : [String],
    allowComments : { 
        type : String, 
        enum : Object.values(AllowCommentsEnum), 
        default : AllowCommentsEnum.ALLOW },
    avilability : { 
        type : String, 
        enum : Object.values(AvilabilityEnum), 
        default : AvilabilityEnum.PUPLIC },

    tags : [ { type : Schema.Types.ObjectId, ref : 'User' } ],
    likes : [ { type : Schema.Types.ObjectId, ref : 'User' } ],

    createdBy : { 
        type : Schema.Types.ObjectId,
        required : true, 
        ref : 'User' },

    freezedBy : { 
        type : Schema.Types.ObjectId, 
        ref : 'User' },
        
    freezedAt : Date,
    restoredBy : { type : Schema.Types.ObjectId, ref : 'User' },
    restoredAt : Date

}, {timestamps : true,});



export const PostModel = models.Post || model<IPost>('Post', postSchema)

export type HPostDocument = HydratedDocument<IPost>