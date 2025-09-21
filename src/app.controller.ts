import express from 'express';
import path from 'node:path';
import type { Express,  Request,  Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors' ;
import helmet from 'helmet';
import rateLimit , {type RateLimitRequestHandler} from 'express-rate-limit';
import authRouter from './Modules/Auth/auth.controller';
import { globalErrorHandler } from './Utils/response/error.response';
import connectDB  from './DB/connection'

config({ path: path.resolve('./config/.env.dev')});

const limiter:RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100,
    message:{
        status: 429,
        message: 'Too many requests, please try again later.'
    }
})

export const bootstrap = async () : Promise<void> => {
    const app:Express = express();
    const port : number  = Number ( process.env.PORT ) || 5000;

    
    app.use(cors(), express.json(), helmet()); // global middleware
    app.use(limiter);

    await connectDB();

    app.get('/users', (req : Request , res : Response) => {
        return res.status(200).json({message : ' hello from express with typescript'})
    })

    app.use('/api/auth', authRouter);


    app.use(globalErrorHandler);



    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}