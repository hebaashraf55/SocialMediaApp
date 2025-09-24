import { Router } from 'express';
import  UserService from './user.service';
import { endPoint } from './user.authorization';
import { authentication } from '../../Middlewares/authentication.middleware';

const router = Router();

router.get('/profile', authentication(endPoint.profile), UserService.getProfile);



export default router; 