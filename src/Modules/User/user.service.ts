import type { Request, Response, NextFunction } from 'express';
import { ILogOutDTO } from './user.dto';
import { createLoginCredentials, createRevokeToken, logOutEnum } from '../../Utils/security/token';
import { Types, UpdateQuery } from 'mongoose';
import { HUserDocument, IUser, UserModel } from '../../DB/Models/User.model';
import { UserRepository } from '../../DB/reposetories/user.repository';
import { JwtPayload } from 'jsonwebtoken';
import { FriendRepository } from '../../DB/reposetories/friend.repository';
import { FriendModel } from '../../DB/Models/friendRequest.model';
import { BadRequestException, ConfilectException, NotFoundException } from '../../Utils/response/error.response';


class UserService {
    private _userModel = new UserRepository(UserModel)
    private _friendModel = new FriendRepository(FriendModel)

    constructor() {}

       getProfile = async (req : Request, res : Response, next : NextFunction) :Promise<Response> => {

            return res.status(200).json({message : ' Done', user: req.user , decoded : req.decoded})
        }

        logOut = async (req : Request, res : Response) : Promise<Response> => {
            const {flag} : ILogOutDTO = req.body;
            let statusCode = 200;
            const update : UpdateQuery<IUser> = {};

            switch (flag) {
                case logOutEnum.all:
                    update.changeCridentialsTime = new Date()
                    break;
                case logOutEnum.only:
                     await createRevokeToken(req.decoded as JwtPayload)
                 statusCode = 201
                    break;
                default:
                    break;
            }

            await this._userModel.updateOne({filter : {_id : req.decoded?._id}, update})
            return res.status(statusCode).json({message : ' Done'})
        }

        refreshToken = async (req : Request, res : Response) : Promise<Response> => {

            const credentials = await createLoginCredentials(req.user as HUserDocument)
            await createRevokeToken(req.decoded as JwtPayload)
            return res.status(201).json({message : ' Done', data : credentials})
        }


        friendRequest = async (req : Request, res : Response) : Promise<Response> => {

            const { userId } = req.params as unknown as { userId : Types.ObjectId};
            const checkFrienRequestExists = await this._friendModel.findOne({
                filter : {
                    createdBy : { $in : [ req.user?._id , userId ] },
                    sentTo : { $in : [ req.user?._id , userId ] },
                }
            })
            if(checkFrienRequestExists) throw new Error('Friend Request Already Sent')
            const user = await this._userModel.findOne({
                filter : {
                    _id : userId
                }
            })
            if(!user) throw new NotFoundException('User Not Found')
            const [ friend ] = await this._friendModel.create({
                data : [
                    {
                        createdBy : req.user?._id as Types.ObjectId,
                        sendTo : userId
                    }
                ]
            }) || [];
            if(!friend) throw new BadRequestException('Friend Request Not Sent')


            return res.status(200).json({ message : ' Done', data :friend })
        }

        acceptFriend = async (req : Request, res : Response) : Promise<Response> => {
            
            const { requestId } = req.params as unknown as { requestId : Types.ObjectId}

            const checkFrienRequestExists = await this._friendModel.findOneAndUpdate({
                filter : {
                    _id : requestId,
                    sendTo : req.user?._id,
                    acceptedAt : { $exists : false }
                },
                update : {
                    acceptedAt : new Date(),
                }
            })
            if(!checkFrienRequestExists) 
                throw new ConfilectException('Fail Tp Accept Friend Request')

            await Promise.all([
                await this._userModel.updateOne({
                    filter : {
                        _id : checkFrienRequestExists.createdBy,
                    },
                    update : {
                        $addToSet : {
                            friends : checkFrienRequestExists.sendTo
                        }
                    }
                }),
                await this._userModel.updateOne({
                    filter : {
                        _id : checkFrienRequestExists.sendTo,
                    },
                    update : {
                        $addToSet : {
                            friends : checkFrienRequestExists.createdBy
                        }
                    }
                })
                ])
                return res.status(200).json({message : ' Done'})

    }
}
export default new UserService;
