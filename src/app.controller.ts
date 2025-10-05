import express from 'express';
import path from 'node:path';
import type { Express,  Request,  Response } from 'express';
import { config } from 'dotenv';
import cors from 'cors' ;
import helmet from 'helmet';
import rateLimit , {type RateLimitRequestHandler} from 'express-rate-limit';
config({ path: path.resolve('./config/.env.dev')});
import authRouter from './Modules/Auth/auth.controller';
import userRouter from './Modules/User/user.controller';
import postRouter from './Modules/Post/post.controller';
import { BadRequestException, globalErrorHandler } from './Utils/response/error.response';
import connectDB  from './DB/connection'
import { createGetPreSignedURL, deleteFile, deleteFiles, getFile } from './Utils/multer/s3.config';
import { promisify } from 'node:util';
import { pipeline } from 'node:stream';
const createS3WriteStreamPipe = promisify(pipeline);



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

    // delete file
    app.get('/test-s3', async (req : Request , res : Response) => {
        const {Key} = req.query as {Key : string};
        const results = await deleteFile({ Key : Key as string })
        return res.status(200).json({message: ' Done', results})
    })
    
    // delete all files
    app.get('/test', async (req : Request , res : Response) => {
        const results = await deleteFiles({
            urls : [
                'Social APP/users/68d46e15ca2014640a8b8f38/cover/164a00a4-4d7a-4dd9-b11c-051f4278712c-photo2.jpg',
                'Social APP/users/68d46e15ca2014640a8b8f38/cover/36a2bd9f-ee9f-460d-bece-8dd64f347837-WhatsApp Image 2024-05-15 at 1.15.01 AM.jpeg',

            ]
        })
        return res.status(200).json({message: ' Done', results})
    })


    app.get('/upload/pre-sign/*path', async (req : Request , res : Response) => {
        const { downloadName , download } = req.query as { downloadName : string , download : string };
        const { path } = req.params as unknown as { path : string[]};
        const  Key  = path.join('/') 
        const  url  = await createGetPreSignedURL({
            Key,
            downloadName : downloadName as string,
            download : download as string
        })
        return res.status(200).json({message: ' Done', url})
    })

    // get asset
    app.get('/upload/*path', async(req : Request , res : Response) => {
        const { downloadName } = req.query;
        const { path } = req.params as unknown as { path :string[]};
        const Key = path.join('/')
        const s3Response = await getFile({ Key })
        if (!s3Response?.Body){
            throw new BadRequestException("File To Get Asset")
        }
        res.setHeader('Content-Type', `"Content-Type", ${s3Response.ContentType}` || 'application/octet-stream');
        if(downloadName){
            res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`)
        }
        return await createS3WriteStreamPipe(
            s3Response.Body as NodeJS.ReadableStream,
            res
        )
        
    })


    app.use('/api/auth', authRouter);
    app.use('/api/user', userRouter);
    app.use('/api/post', postRouter);


    app.use(globalErrorHandler);



    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
}