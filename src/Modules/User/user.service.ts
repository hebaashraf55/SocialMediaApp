import type { Request, Response, NextFunction } from 'express';


class UserService {
    constructor() {}


       getProfile = async (req : Request, res : Response, next : NextFunction) => {
        
            return res.status(200).json({message : ' Done', user: req.user , decoded : req.decoded})
        }
    }

export default new UserService;
