import { Router } from 'express';
import { authentication } from '../../Middlewares/authentication.middleware';
import { endPoint } from './chat.authorization';
import { TokenEnum } from '../../Utils/security/token';
import { validation } from '../../Middlewares/validation.middleware';
import * as validators from './chat.validation';
import chatService from './chat.service'

const router: Router = Router({
    mergeParams: true
});


router.get('/', 
    authentication(endPoint.getChat, TokenEnum.ACCESS), 
    validation(validators.getChatSchema), 
     chatService.getChat
)

router.post('/group', 
    authentication(endPoint.getChat, TokenEnum.ACCESS), 
    validation(validators.createGroupChatSchema), 
     chatService.createGroupChat
)

router.get('/group/:groupId',
    authentication(endPoint.getChat, TokenEnum.ACCESS),
    validation(validators.getGroupChatSchema),
    chatService.getGroupChat
)


export default router;

