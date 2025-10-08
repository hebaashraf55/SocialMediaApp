import { Router } from "express";
import postService from "./post.service";
import * as validators from './post.validation'
import { authentication } from "../../Middlewares/authentication.middleware";
import { endPoint } from "./post.authorization";
import { TokenEnum } from "../../Utils/security/token";
import { cloudFileUpload, fileValidation } from "../../Utils/multer/cluod.multer";
import { validation } from "../../Middlewares/validation.middleware";
const router = Router();

router.post('/',
    authentication( endPoint.createPost, TokenEnum.ACCESS),
    cloudFileUpload({validation : fileValidation.images}).array('attachments', 3),
    validation(validators.createPostSchema),
    postService.createPost)


router.patch('/:postId/like',
    authentication(endPoint.createPost, TokenEnum.ACCESS),
    validation(validators.likeUnlikePostSchema),
    postService.likeUnlikePost)

router.patch('/:postId',
    authentication(endPoint.createPost, TokenEnum.ACCESS),
    cloudFileUpload({validation : fileValidation.images}).array('attachments', 3),
    validation(validators.updatePostSchema),
    postService.updatePost)

router.get('/',
    authentication(endPoint.createPost, TokenEnum.ACCESS),
    postService.getPosts)





export default router