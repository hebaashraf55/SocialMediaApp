import { JwtPayload } from "jsonwebtoken";
import { Socket } from "socket.io";
import { HUserDocument } from "../../DB/Models/User.model";

export interface IAuthSocket extends Socket {
    criedentials?: {
        user : Partial<HUserDocument>;
        decoded : JwtPayload;
    },
   }