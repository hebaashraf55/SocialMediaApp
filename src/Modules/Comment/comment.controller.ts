import { Router } from 'express';
import commentService from './comment.service';
import { authentication } from '../../Middlewares/authentication.middleware';
import { TokenEnum } from '../../Utils/security/token';
import { endPoint } from './comment.authorization';
import { validation } from '../../Middlewares/validation.middleware';
import * as validators from './comment.validation';
import { cloudFileUpload, fileValidation } from '../../Utils/multer/cluod.multer';
const router : Router = Router({
    mergeParams: true
})


router.post('/',
    authentication(endPoint.createComment, TokenEnum.ACCESS),
    cloudFileUpload({validation : fileValidation.images}).array('attachments', 3),
    validation(validators.createCommentSchema),
    commentService.createComment)

// create reply
router.post('/:commentId/reply',
    authentication(endPoint.createReply, TokenEnum.ACCESS),
    cloudFileUpload({validation : fileValidation.images}).array('attachments', 3),
    validation(validators.createReplySchema), 
    commentService.createReply)





export default router;