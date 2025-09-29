import type { Request, Response, NextFunction } from 'express';
import { ILogOutDTO } from './user.dto';
import { createLoginCredentials, createRevokeToken, logOutEnum } from '../../Utils/security/token';
import { UpdateQuery } from 'mongoose';
import { HUserDocument, IUser, UserModel } from '../../DB/Models/User.model';
import { UserRepository } from '../../DB/reposetories/user.repository';
import { JwtPayload } from 'jsonwebtoken';


class UserService {
    private _userModel = new UserRepository(UserModel)

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

        



    }

export default new UserService;
