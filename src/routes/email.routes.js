import { Router } from 'express';
import { sendReceiptController } from '../controllers/email.controller.js';
import { validateReceipt } from '../middlewares/validator.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

// Aquí definimos la ruta exacta que Postman está buscando
router.post('/send-receipt', authenticate, validateReceipt, sendReceiptController);


export default router;