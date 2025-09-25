import z from 'zod';
import { logOutEnum } from '../../Utils/security/token';

export const logOutSchema = {
    body: z.strictObject({
        flag : z.enum(logOutEnum).default(logOutEnum.only)
    })
}