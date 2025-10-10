import z from 'zod';
import { logOutEnum } from '../../Utils/security/token';
import { generalField } from '../../Middlewares/validation.middleware';

export const logOutSchema = {
    body: z.strictObject({
        flag : z.enum(logOutEnum).default(logOutEnum.only)
    })
}

export const sendFriendRequestSchema = {
    params : z.strictObject({
        userId : generalField.id
    })
}

export const acceptFriendRequestSchema = {
    params : z.strictObject({
        requestId : generalField.id
    })
}