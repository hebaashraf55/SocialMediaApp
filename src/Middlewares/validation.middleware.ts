import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';
import { BadRequestException } from '../Utils/response/error.response';
import z from 'zod';


type ReqTypeKey = keyof Request;
type SchemaType = Partial<Record<ReqTypeKey, ZodType>>;
export const validation = (schema:SchemaType) => {
    return (req:Request , res:Response , next:NextFunction ) : NextFunction => {

        const validationErrors : Array<{
            key:ReqTypeKey,
            issues: Array<{
                message : string,
                path : (string | number | symbol)[]
            }>
        }> = [];
        for (const key of Object.keys(schema) as ReqTypeKey[]) {
            if(!schema[key]) continue;

        const validationResults = schema[key].safeParse(req[key]);
        if (!validationResults.success) {
            const errors = validationResults.error as ZodError
            validationErrors.push({
                key,
                issues : errors.issues.map((issue)=> {
                   return { message: issue.message, path : issue.path }
                }),
            });
        }
        if (validationErrors.length > 0) {
            throw new BadRequestException('Validation Error', { cause : validationErrors});
        }
    }
        return next() as unknown as NextFunction;
    
    }
}

export const generalField = {
    userName : z.string(
            {error : "Username must be string"}
        ).min(3, {
            error : "Username must be at least 3 characters long"
        }).max(25, {
            error : "Username must be at most 25 characters long"
        }),
        email : z.email({
            error : "Invalid email"
        }),
        password : z.string({error : "Password must be string"}),
        confirmPassword : z.string({error : "Confirm Password must be string"}),
        otp : z.string().regex(/^\d{6}/),

}