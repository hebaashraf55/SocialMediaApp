import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, GetObjectCommandOutput, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"; // upload any file
import { StorageEnum } from "./cluod.multer";
import { v4 as uuid } from 'uuid';
import { createReadStream } from "node:fs";
import { BadRequestException } from "../response/error.response";
import { Upload } from "@aws-sdk/lib-storage"; // upload large files
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


export const s3Config = () => {

    return new S3Client({
        region : process.env.REGION as string,
        credentials : {
            accessKeyId : process.env.AWS_ACCESS_KEY_ID as string,
            secretAccessKey : process.env.AWS_SECRET_ACCESS_KEY as string
        }
    })
}

export const uploadFile = async ({ 
    storageApproch = StorageEnum.MEMORY ,
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    ACL = "private" ,
    path = "GENERAL", 
    file ,
} : {
        storageApproch ?: StorageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File,
}) : Promise<string>  => {
    const command = new PutObjectCommand({
        Bucket,
        ACL,
        Key : `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
        Body : storageApproch === StorageEnum.MEMORY ? file.buffer : createReadStream(file.path),
        ContentType : file.mimetype
    });
    await s3Config().send(command);

    if(!command?.input?.Key)
        throw new BadRequestException("Fail To Upload File");

    return command.input.Key;
}


export const uploadLargeFile = async ({ 
    storageApproch = StorageEnum.MEMORY ,
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    ACL = "private" ,
    path = "GENERAL", 
    file ,
} : {
        storageApproch ?: StorageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        file: Express.Multer.File,
}) : Promise<string> => {

    const upload = new Upload({
        client : s3Config(),
        params : {
            Bucket,
            ACL,
            Key : `${process.env.APPLICATION_NAME}/${path}/${uuid()}-${file.originalname}`,
            Body : storageApproch === StorageEnum.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType : file.mimetype
        },
        partSize: 500 * 1024 * 1024
    })
    upload.on('httpUploadProgress', (progress) => {
        console.log( "Upload Progress ", progress);
        
    })
    const { Key } =await upload.done();
    if(!Key) 
        throw new BadRequestException("Fail To Upload File");
    return Key;

}

export const uploadFiles = async ({ 
    storageApproch = StorageEnum.MEMORY ,
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    ACL = "private" ,
    path = "GENERAL", 
    files ,
} : {
        storageApproch ?: StorageEnum,
        Bucket?: string,
        ACL?: ObjectCannedACL,
        path?: string,
        files: Express.Multer.File[],
}) : Promise<string[]> => {

    let urls : string[] = [];
    urls = await Promise.all(
        files.map(
            (file) => uploadFile({ storageApproch ,Bucket, ACL, path, file})
        ));

    return urls;
}

export const createPreSignedURL  = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string,
    path = "general",
    ContentType , 
    Originalname ,
    expiresIn = 120

} : {
    Bucket ?: string,
    path ?: string,
    ContentType : string,
    Originalname : string,
    expiresIn ?: number
}) : Promise<{url : string ; Key: string}> => {
    const command = new PutObjectCommand({
        Bucket,
        Key : `${process.env.APPLICATION_NAME}/${path}/${uuid()}-presigned-${Originalname}`,
        ContentType
    })
    const url = await getSignedUrl(s3Config(), command, {
        expiresIn 
    })
    if(!url || !command?.input?.Key)
        throw new BadRequestException("Fail To Generate Pre Signed Url");

    return {url, Key: command.input.Key}
}

export const createGetPreSignedURL = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string,
    Key,
    downloadName = 'dumy',
    download = 'false',
    expiresIn = 120

} : {
    Bucket ?: string,
    Key : string,
    downloadName ?: string,
    download ?:string,
    expiresIn ?: number
}) => {

    const command = new GetObjectCommand({
        Bucket,
        Key,
        ResponseContentDisposition: download === 'true' ? `attachment; filename="${downloadName}"` : undefined
    })
    const url = await getSignedUrl(s3Config(), command,{
        expiresIn
    })
    if(!url )
        throw new BadRequestException("Fail To Generate Pre Signed Url");

    return url ;
}

export const getFile = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    Key ,
} : {
        Bucket?: string,
        Key : string,
}) : Promise<GetObjectCommandOutput> => {
    const command = new GetObjectCommand({
        Bucket,
        Key
    })
    return await s3Config().send(command);

}

// delete file
export const deleteFile = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    Key ,
} : {
        Bucket?: string,
        Key : string,
}) : Promise<GetObjectCommandOutput> => {
    const command = new DeleteObjectCommand({
        Bucket,
        Key
    })
    return await s3Config().send(command);

}

// delete files
export const deleteFiles = async ({ 
    Bucket = process.env.AWS_BUCKET_NAME as string, 
    urls ,
    Quiet = false,
} : {
        Bucket?: string,
        urls : string[],
        Quiet ?: boolean
}) : Promise<GetObjectCommandOutput> => {
    const Objects = urls.map((url) => { return {Key : url} })
    const command = new DeleteObjectsCommand({
        Bucket,
        Delete : {
            Objects,
            Quiet
        }
    })
    return await s3Config().send(command);
}