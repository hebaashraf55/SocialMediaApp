import { Types } from "mongoose";
import { ChatModel } from "../../DB/Models/chat.model";
import { UserModel } from "../../DB/Models/User.model";
import { ChatRepository } from "../../DB/reposetories/chat.repository";
import { UserRepository } from "../../DB/reposetories/user.repository";
import { ICreateGroupChatDTO, IGetChatDTO, IGetGroupChatDTO, IJoinRoomDTO, ISayHiDTO, ISendGroupMessageDTO, ISendMessageDTO } from "./chat.dto";
import { Request, Response } from "express";
import { BadRequestException, NotFoundException } from "../../Utils/response/error.response";
import { v4 as uuid } from 'uuid';

export class ChatService {
    private _chatmodel = new ChatRepository(ChatModel);
    private _usermodel = new UserRepository(UserModel);
    constructor() {}

    // Rest API
    getChat = async (req : Request, res: Response) => {

        const { userId } = req.params as IGetChatDTO;

        const chat = await this._chatmodel.findOne({
            filter : { 
                participants : {
                    $all : [ 
                        req.user?._id as Types.ObjectId, 
                        Types.ObjectId.createFromHexString(userId) 
                    ]
                },
                group : { $exists : false }
            },
            options : { populate : 'participants' }
        });
        if(!chat) throw new NotFoundException('Chat Not Found')

        return res.status(200).json({message : 'Done', data : {chat}})
    };

    getGroupChat = async (req : Request, res: Response) => {

        const { groupId } = req.params as IGetGroupChatDTO;

        const chat = await this._chatmodel.findOne({
            filter : {
                _id : Types.ObjectId.createFromHexString(groupId),
                group : { $exists : true },
                participants : { $in : [req.user?._id as Types.ObjectId] }
            },
            options : { populate : "messages.createdBy" }
        })

        if(!chat) throw new BadRequestException('Fail To Find Chat')
        
        return res.status(200).json({message : 'Done', data : { chat }})
    }

    createGroupChat = async (req : Request, res: Response) => {
        const { participants, group } = req.body as ICreateGroupChatDTO 
        
        const dbParticipants = participants.map((participant) => {
            return Types.ObjectId.createFromHexString(participant)
        })
        const users = await this._usermodel.find({
            filter : {
                _id : { $in : dbParticipants },
                friends : { $in : [req.user?._id as Types.ObjectId] }
            }
        })
        if(dbParticipants.length != users.length) 
            throw new BadRequestException('Please Provide Valid dbParticipants')

        const roomId = uuid() 

        const [ newGroup ] = await this._chatmodel.create({
            data : [{
                createdBy : req.user?._id as Types.ObjectId,
                group,
                roomId,
                participants : [...dbParticipants, req.user?._id as Types.ObjectId]
            }]
        }) || [];
        if(!newGroup) throw new BadRequestException('Fail to create group chat')
        
        
        return res.status(200).json({message : 'Done', data : { newGroup }})
    }

    // IO API
    sayHi = ({message, socket, callback, io} : ISayHiDTO) => {
        try {
            console.log(message);
            callback ? callback("I Recived Your Message") : undefined           
        } catch (error) {
            socket.emit("custom_error", error)
        }
    };

    sendMessage = async ({content, sendTo, socket, io} : ISendMessageDTO) => {
        try {
            const createdBy = socket.criedentials?.user._id as Types.ObjectId;
            const user = await this._usermodel.findOne({
                filter : {
                    _id : Types.ObjectId.createFromHexString(sendTo),
                    friends : {$in : [createdBy]}
                }
            })
            if(!user) throw new NotFoundException('User Not Found')

            const chat = await this._chatmodel.findOneAndUpdate({
                filter : {
                    participants : {
                        $all : 
                        [  
                        createdBy as Types.ObjectId,
                            Types.ObjectId.createFromHexString(sendTo) 
                        ]
                    },
                    group : { $exists : false }
                },
                update : {
                    $addToSet : {
                        message : {
                            content,
                            createdBy
                        }
                    }
                }
            })

            if(!chat){
                const [newChat] = await this._chatmodel.create({
                    data : [{
                        createdBy,
                        messages : [{ content, createdBy}],
                        participants : [ createdBy, Types.ObjectId.createFromHexString(sendTo) ]
                    }]
                }) || [];
                if(!newChat) throw new BadRequestException('Fail to Create Chat')
            }

            io?.emit('successMessage', { content })
            io?.emit('newMessage', { content , from : socket.criedentials?.user})
        } catch (error) {
            socket.emit("custom_error" , error)
        }
    }

    joinRoom = async ({roomId , socket, io} : IJoinRoomDTO) => {
        try {
            const chat = await this._chatmodel.findOne({
                filter : {
                    roomId,
                    participants : { $in : socket.criedentials?.user._id as Types.ObjectId },
                    group : { $exists : true }
                }
            })
            
            if(!chat) throw new NotFoundException('Fail To Join Room')
            socket.join( chat.roomId as string )

        } catch (error) {
            socket.emit("custom_error" , error)
        }
    }


    sendGroupMessage = async ({content, groupId, socket, io} : ISendGroupMessageDTO) => {
        try {
            const createdBy = socket.criedentials?.user?._id as Types.ObjectId;
            const chat = await this._chatmodel.findOneAndUpdate({
                filter : {
                    _id : Types.ObjectId.createFromHexString(groupId),
                    participants : { $in : [ createdBy as Types.ObjectId ] },
                    group : { $exists : true }
                },
                update : {
                    $addToSet : {
                        messages : {
                            content,
                            createdBy
                        }
                    }
                }
            })
            if(!chat) throw new NotFoundException('Chat Not Found')
            io?.emit('successMessage', { content })
        } catch (error) {
            socket.emit("custom_error" , error)
        }
    }




}


export default new ChatService();