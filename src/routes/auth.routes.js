// src/routes/auth.routes.js
import { Router } from 'express';
import {
    registerController,
    loginController,
    changePasswordController,
    updateUserController // Importar el nuevo controlador
} from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas existentes
router.post('/auth/register', registerController);
router.post('/auth/login', loginController);
router.post('/auth/change-password', authenticate, changePasswordController);

// Nueva ruta para actualizar perfil (requiere API Key según tu middleware)
router.put('/auth/update-profile', authenticate, updateUserController);

export default router;