import z from 'zod';
import { generalField } from '../../Middlewares/validation.middleware';


export const logInSchema = { 
    body : z.strictObject({
        email : generalField.email,
        password : generalField.password,
    })
}
export const confirmeEmailSchema = { 
    body : z.strictObject({
        email : generalField.email,
        otp : generalField.otp,
    })
}


export const signUpSchema = {
    body : logInSchema.body.extend({
       userName : generalField.userName,
        confirmPassword : generalField.confirmPassword 

    }).superRefine( (data, ctx) => {
        if (data.password !== data.confirmPassword) {
            ctx.addIssue({
                code : "custom",
                path : ["confirmPassword"],
                message : "Password and Confirm Password must be same"
            })
        }
        
    })
}



