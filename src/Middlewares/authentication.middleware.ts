import type { Request, Response, NextFunction } from "express"
import { BadRequestException, ForbiddenException} from "../Utils/response/error.response"
import { decodeToken, TokenEnum } from "../Utils/security/token"
import { RoulEnum } from "../DB/Models/User.model"


export const authentication = (
    accesRoles: RoulEnum[] =[], 
    tokenType : TokenEnum = TokenEnum.ACCESS ) => 
        {
    return async ( req : Request, res : Response, next : NextFunction ) => {

        if(!req.headers.authorization) {
            throw new BadRequestException("Missing Authorization Header")
        }
        const { decoded, user} = await decodeToken({authorization : req.headers.authorization, tokenType})

        if(!accesRoles.includes(user.role)) {
            throw new ForbiddenException(" You Are Not Authorized To Access This Route")
        }

        req.user = user;
        req.decoded = decoded;

        next()

    }
}