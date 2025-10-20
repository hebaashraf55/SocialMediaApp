import { Router } from 'express';
import  userService from './user.service'
import { endPoint } from './user.authorization';
import { authentication } from '../../Middlewares/authentication.middleware';
import { TokenEnum } from '../../Utils/security/token';
import * as validators from './user.validation';
import { validation } from '../../Middlewares/validation.middleware';
import chatRouter from '../Chat/chat.controller';

const router = Router();

router.use('/:userId/chat', chatRouter);

router.get('/profile', 
    authentication(endPoint.profile), 
    userService.getProfile);

router.post('/logout', 
    authentication(endPoint.logout), 
    userService.logOut
)
router.post('/refresh-token', 
    authentication(endPoint.refreshtoken, TokenEnum.ACCESS),
    userService.refreshToken)

router.post('/:userId/friend-request', 
    authentication(endPoint.friendRequest, TokenEnum.ACCESS),
    validation(validators.sendFriendRequestSchema),
    userService.friendRequest)


router.patch('/:requestId/accept', 
    authentication(endPoint.accepFriend, TokenEnum.ACCESS),
    validation(validators.acceptFriendRequestSchema),
    userService.acceptFriend)



export default router; 