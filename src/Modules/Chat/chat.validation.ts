import z from 'zod'
import { generalField } from '../../Middlewares/validation.middleware'


export const getChatSchema = {
    params : z.strictObject({
        userId : generalField.id,
    })
}

export const createGroupChatSchema = {
    body : z.strictObject({
        participants : z.array(generalField.id).min(1),
        group : z.string().min(1).max(100),
    })
    .superRefine((data, ctx) => {
        if( 
            data.participants?.length && 
            data.participants.length !== [...new Set(data.participants)].length)
            {
            ctx.addIssue({
                code : "custom",
                path : ["participants"],
                message : "Tags Provide unique participants"
            })
        
        }
    })
    }

export const getGroupChatSchema = {
    params : z.strictObject({
        groupId : generalField.id
    })
}