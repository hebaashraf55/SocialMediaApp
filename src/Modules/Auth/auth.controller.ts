import { Router } from 'express';
import  authService from './auth.service';
import { confirmeEmailSchema, logInSchema, signUpSchema } from './auth.validation';
import { validation } from '../../Middlewares/validation.middleware'; 
import { authentication } from '../../Middlewares/authentication.middleware';
import { cloudFileUpload, fileValidation, StorageEnum } from '../../Utils/multer/cluod.multer';
import { endPoint } from './auth.authorization';
import { TokenEnum } from '../../Utils/security/token';

const router: Router = Router();

router.post('/signup', validation(signUpSchema),authService.signUp);
router.post('/login', validation(logInSchema),authService.logIn);

router.patch('/profile-image', 
    authentication(endPoint.image, TokenEnum.ACCESS), 
    cloudFileUpload({
        storageApproch : StorageEnum.MEMORY, 
        validation : fileValidation.images,
        // maxsize : 2
    }).single('attachment'), 
    authService.profileImage)

    router.patch('/profile-cover-image', 
    authentication(endPoint.image, TokenEnum.ACCESS), 
    cloudFileUpload({
        storageApproch : StorageEnum.DISK, 
        validation : fileValidation.images,
        maxsize : 2
    }).array('attachments', 5), 
    authService.coverImage)



router.patch('/confirme-email', 
    validation(confirmeEmailSchema),
    authService.confirmeEmail);



export default router;

