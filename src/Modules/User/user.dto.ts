import { logOutSchema } from "./user.validation";
import z from 'zod';

export type ILogOutDTO = z.infer<typeof logOutSchema.body>