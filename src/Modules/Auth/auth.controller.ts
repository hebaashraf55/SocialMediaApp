import { Router } from 'express';
import  authService from './auth.service';
import { confirmeEmailSchema, logInSchema, signUpSchema } from './auth.validation';
import { validation } from '../../Middlewares/validation.middleware'; 

const router: Router = Router();

router.post('/signup', validation(signUpSchema),authService.signUp);
router.post('/login', validation(logInSchema),authService.logIn);

router.patch('/confirme-email', validation(confirmeEmailSchema),authService.confirmeEmail);



export default router;