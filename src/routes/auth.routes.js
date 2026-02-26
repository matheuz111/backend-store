// src/routes/auth.routes.js
import { Router } from 'express';
import {
    registerController,
    loginController,
    changePasswordController,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/auth/register',         registerController);
router.post('/auth/login',            loginController);
router.post('/auth/change-password',  changePasswordController);

export default router;