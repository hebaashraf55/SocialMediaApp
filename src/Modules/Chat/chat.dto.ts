import z from "zod";
import { IAuthSocket } from "../gateway/gateway.dto";
import { createGroupChatSchema, getChatSchema, getGroupChatSchema } from "./chat.validation";
import { Server } from "socket.io";


export interface ISayHiDTO {
    message: string,
    socket : IAuthSocket,
    callback : any,
    io : Server
}
export interface ISendMessageDTO {
    content : string,
    sendTo : string,
    socket : IAuthSocket,
    io : Server
}

export interface ISendGroupMessageDTO {
    content : string,
    groupId : string,
    socket : IAuthSocket,
    io : Server
}

export interface IJoinRoomDTO {
    roomId : string,
    socket : IAuthSocket,
    io : Server
}


export type IGetChatDTO = z.infer<typeof getChatSchema.params>
export type ICreateGroupChatDTO = z.infer<typeof createGroupChatSchema.body>
export type IGetGroupChatDTO = z.infer<typeof getGroupChatSchema.params>
