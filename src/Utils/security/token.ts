import { JwtPayload, Secret, sign, SignOptions, verify } from "jsonwebtoken";
import { HUserDocument, RoulEnum, UserModel } from "../../DB/Models/User.model";
import { BadRequestException, UnAuthorizedException } from "../response/error.response";
import { UserRepository } from "../../DB/reposetories/user.repository";
import { v4 as uuid } from "uuid";
import { TokenModel } from "../../DB/Models/token.model";
import { TokenRepository } from "../../DB/reposetories/Token.repository";

export enum SignatureLevelEnum {
    ADMIN = 'ADMIN',
    USER = 'USER'
}
export enum TokenEnum {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH'
}
export enum logOutEnum {
    only = "ONLY",
    all = "ALL"
}

export const generateToken = async ({
    payload, 
    secret = process.env.ACCESS_USER_SIGNATURE as string, 
    options = { expiresIn : Number(process.env.ACCESS_EXPIRES_IN) }
} 
    : 
    {  payload : object , 
        secret ?: Secret, 
        options ?: SignOptions}) 
    : Promise <string> => {
    
        return  sign(payload, secret, options);
}
export const verifyToken = async ({
    token, 
    secret = process.env.ACCESS_USER_SIGNATURE as string, 
} 
    : 
    {  token : string , 
        secret ?: Secret, 
        }) 
    : Promise <JwtPayload> => {
    
        return verify(token, secret) as JwtPayload;
}


export const getSignatureLevel = async (role : RoulEnum = RoulEnum.USER) => {
    let signatureLevel : SignatureLevelEnum = SignatureLevelEnum.USER

    switch(role) {
        case RoulEnum.ADMIN:
            signatureLevel = SignatureLevelEnum.ADMIN
            break;
        case RoulEnum.USER:
            signatureLevel = SignatureLevelEnum.USER
            break;
         default:
            break;
    }

    return signatureLevel
}

export const getSignatures = async (
    signatureLevel : SignatureLevelEnum = SignatureLevelEnum.USER) => {

    let signatures : { access_signature : string , refresh_signature: string } = 
    { access_signature : '', refresh_signature : '' };

    switch(signatureLevel) {
        case SignatureLevelEnum.ADMIN:
            signatures.access_signature = process.env.ACCESS_ADMIN_SIGNATURE as string
            signatures.refresh_signature = process.env.REFRESH_ADMIN_SIGNATURE as string
            break;
        case SignatureLevelEnum.USER:
            signatures.access_signature = process.env.ACCESS_USER_SIGNATURE as string
            signatures.refresh_signature = process.env.REFRESH_USER_SIGNATURE as string
            break;
         default:
            break;
    }

    return signatures
}
export const createLoginCredentials = async (user : HUserDocument) => {
    const signatureLevel = await getSignatureLevel(user.role)
    const signatures = await getSignatures(signatureLevel)

    const jwtid = uuid();
    const accessToken = await generateToken({
        payload : { _id : user._id}, 
        secret : signatures.access_signature, 
        options : { expiresIn : Number(process.env.ACCESS_EXPIRES_IN), jwtid}})

    const refreshToken = await generateToken({
        payload : { _id : user._id} , 
        secret : signatures.refresh_signature,
        options : { expiresIn : Number(process.env.REFRESH_EXPIRES_IN), jwtid}})

    return {
        accessToken,
        refreshToken
    } 
}

export const decodeToken = async ({ authorization, tokenType = TokenEnum.ACCESS }: 
    { authorization : string, tokenType ?: TokenEnum}) => {

    const userModel = new UserRepository(UserModel)
    const tokenModel = new TokenRepository(TokenModel)

    const[ bearer, token ] = authorization.split(' ')
    if(!bearer || !token) throw new UnAuthorizedException("Missing Authorization Header")
        const signature = await getSignatures(bearer as SignatureLevelEnum)

    const decoded = await verifyToken({
        token, 
        secret : tokenType === TokenEnum.REFRESH 
        ? signature.refresh_signature 
        : signature.access_signature
    })
    if(!decoded?._id || !decoded.iat)
        throw new UnAuthorizedException("Invalid Token Payload") 
    if(await tokenModel.findOne({filter : {jti : decoded.jti}}))
        throw new UnAuthorizedException("Invalid Or Old Login Credentials") 

    const user = await userModel.findOne({
        filter : {_id : decoded._id}
    })
    if(!user) throw new UnAuthorizedException("Not Register Account")

    if(user.changeCridentialsTime.getTime() || 0  > decoded.iat * 1000)
        throw new UnAuthorizedException("Invalid Or Old Login Credentials")

    return {user,decoded}

}

export const createRevokeToken = async ( decoded:JwtPayload) => {
    const tokenModel = new TokenRepository(TokenModel)
    const [ result ] =await tokenModel.create({
        data: [
            { jti: decoded?.jti as string,
             expiresIn : ( decoded?.iat as number ) + Number(process.env.REFRESH_EXPIRES_IN),
             userId : decoded?._id
             }
        ], 
         options: {validateBeforeSave : true}
    }) || []

    if(!result) throw new BadRequestException("Fail To Create Revoke Token")

    return result
}