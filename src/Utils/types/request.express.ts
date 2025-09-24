import { JwtPayload } from "jsonwebtoken";
import { HUserDocument } from "../../DB/Models/model.user";


declare module 'express-serve-static-core' {
        interface Request {
            user?: HUserDocument;
            decoded?: JwtPayload
        }
    }