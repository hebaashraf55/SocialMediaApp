import type { Request, Response, NextFunction } from "express"
import { BadRequestException} from "../Utils/response/error.response"
import { decodeToken } from "../Utils/security/token"
import { HUserDocument } from "../DB/Models/model.user"
import { JwtPayload } from "jsonwebtoken"

interface IAuthRequest extends Request {
    user : HUserDocument,
    decoded : JwtPayload
}


export const authentication = () => {
    return async ( req : IAuthRequest, res : Response, next : NextFunction ) => {

        if(!req.headers.authorization) {
            throw new BadRequestException("Missing Authorization Header")
        }
        const { decoded, user} = await decodeToken({authorization : req.headers.authorization})

        req.user = user;
        req.decoded = decoded;

        next()

    }
}