import { model, Types, Schema, models, HydratedDocument } from 'mongoose';


export interface IMessage {
    content : string;
    // common
    createdBy : Types.ObjectId;
    createdAt ?: Date,
    updatedAt ?: Date
}

export interface IChat { 
    // ovo
    participants : Types.ObjectId[];
    messages : IMessage[];
    // ovm
    group ?: string;
    groupImage ?: string;
    roomId ?: string;
    // common
    createdBy : Types.ObjectId;
    createdAt : Date,
    updatedAt ?: Date

}

export type HChatDocument = HydratedDocument<IChat>
export type HMessageDocument = HydratedDocument<IMessage>


export const messageSchema = new Schema<IMessage>({
    content : { 
        type : String, 
        minLength : 2, 
        maxLength : 500000, 
        required : true
    },
    createdBy : { 
        type : Schema.Types.ObjectId,
        required : true, 
        ref : 'User' },
    createdAt : Date,
    updatedAt : Date
}, {timestamps : true,})

export const chatSchema = new Schema<IChat>({
    participants : [ { type : Schema.Types.ObjectId, required : true, ref : 'User' } ],
    messages : [ messageSchema ],
    group : String,
    groupImage : String,
    roomId : { type : String, required : function(){ return this.roomId } },
    createdBy : { 
        type : Schema.Types.ObjectId,
        required : true, 
        ref : 'User' },
    createdAt : Date,
    updatedAt : Date

}, {timestamps : true,});



export const ChatModel = models.Chat || model<IChat>('Chat', chatSchema)

