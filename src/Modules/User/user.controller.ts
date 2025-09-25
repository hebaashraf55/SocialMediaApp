import { Router } from 'express';
import  userService from './user.service';
import { endPoint } from './user.authorization';
import { authentication } from '../../Middlewares/authentication.middleware';
import { TokenEnum } from '../../Utils/security/token';

const router = Router();

router.get('/profile', 
    authentication(endPoint.profile), 
    userService.getProfile);

router.post('/logout', 
    authentication(endPoint.logout), 
    userService.logOut
)
router.post('/refresh-token', 
    authentication(endPoint.refreshtoken, TokenEnum.REFRESH),
    userService.refreshToken)


export default router; 