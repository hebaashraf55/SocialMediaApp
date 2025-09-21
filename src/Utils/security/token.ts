import { Secret, sign, SignOptions } from "jsonwebtoken";


export const generateToken = async ({
    payload, 
    secret = process.env.ACCESS_USER_SIGNATURE as string, 
    options = { expiresIn : Number(process.env.ACCESS_USER_EXPIRES_IN) }
} 
    : 
    {  payload : object , 
        secret ?: Secret, 
        options ?: SignOptions}) 
    : Promise<string> => {
    
        return  sign(payload, secret, options);
}