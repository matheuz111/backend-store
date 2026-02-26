// src/controllers/verification.controller.js
import { sendEmail } from '../services/email.service.js';

// Almacén temporal en memoria: { email: { code, expiresAt, username } }
// En producción, reemplaza esto con Redis o tu base de datos
const pendingVerifications = new Map();

// Genera un código OTP de 6 dígitos
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Elimina códigos expirados (limpieza periódica)
const cleanupExpired = () => {
    const now = Date.now();
    for (const [email, data] of pendingVerifications.entries()) {
        if (data.expiresAt < now) {
            pendingVerifications.delete(email);
        }
    }
};

export const sendVerificationController = async (req, res) => {
    const { email, username } = req.body;

    cleanupExpired();

    // Rate limiting simple: no permitir reenvío antes de 60 segundos
    const existing = pendingVerifications.get(email);
    if (existing && existing.expiresAt - 9 * 60 * 1000 > Date.now() - 60 * 1000) {
        return res.status(429).json({
            success: false,
            error: 'Debes esperar 60 segundos antes de solicitar un nuevo código.'
        });
    }

    const code = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    // Guardar en memoria
    pendingVerifications.set(email, { code, expiresAt, username });

    const htmlContent = `
        <div style="font-family: 'Segoe UI', sans-serif; background-color: #0d0d0d; padding: 40px 10px; color: #ffffff;">
            <div style="max-width: 560px; margin: 0 auto; background-color: #111827; border-radius: 16px; overflow: hidden; border: 1px solid #1e3a5f; box-shadow: 0 20px 60px rgba(0,0,0,0.8);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 60%, #312e81 100%); padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; color: #ffffff;">KIDSTORE</h1>
                    <p style="margin: 8px 0 0; font-size: 13px; color: #93c5fd; letter-spacing: 1px;">Verificación de cuenta</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 40px 35px;">
                    <p style="font-size: 16px; color: #e2e8f0; margin-top: 0;">Hola <strong style="color: #60a5fa;">${username}</strong>,</p>
                    <p style="color: #94a3b8; line-height: 1.7; font-size: 15px;">
                        Para completar tu registro en KidStore, ingresa el siguiente código de verificación. 
                        Este código expira en <strong style="color: #fbbf24;">10 minutos</strong>.
                    </p>
                    
                    <!-- OTP Box -->
                    <div style="background: linear-gradient(135deg, #1e3a5f, #1e2d4f); border: 1px solid #2563eb; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0;">
                        <p style="margin: 0 0 8px; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 2px;">Tu código de verificación</p>
                        <p style="margin: 0; font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace; text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);">${code}</p>
                    </div>
                    
                    <div style="background-color: #1e2330; border-left: 3px solid #f59e0b; padding: 14px 18px; border-radius: 0 8px 8px 0; margin-top: 20px;">
                        <p style="margin: 0; color: #d1d5db; font-size: 13px; line-height: 1.5;">
                            ⚠️ Si no solicitaste este código, ignora este mensaje. Tu cuenta no ha sido modificada.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="background-color: #0a0f1a; padding: 20px; text-align: center; border-top: 1px solid #1e2d4f;">
                    <p style="margin: 0; font-size: 11px; color: #374151;">© ${new Date().getFullYear()} KIDSTORE. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    `;

    try {
        await sendEmail(email, `${code} – Tu código de verificación KidStore`, htmlContent);
        res.status(200).json({
            success: true,
            message: `Código enviado a ${email}`,
            // En desarrollo puedes descomentar la siguiente línea para ver el código:
            // debug_code: code
        });
    } catch (error) {
        pendingVerifications.delete(email); // Limpia si falló el envío
        res.status(500).json({ success: false, error: 'No se pudo enviar el correo. Intenta de nuevo.' });
    }
};

export const verifyCodeController = (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Email y código son requeridos.' });
    }

    const record = pendingVerifications.get(email);

    if (!record) {
        return res.status(404).json({ success: false, error: 'No hay verificación pendiente para este email.' });
    }

    if (Date.now() > record.expiresAt) {
        pendingVerifications.delete(email);
        return res.status(410).json({ success: false, error: 'El código ha expirado. Solicita uno nuevo.' });
    }

    if (record.code !== code.trim()) {
        return res.status(400).json({ success: false, error: 'Código incorrecto. Inténtalo de nuevo.' });
    }

    // Código válido — eliminar de pendientes
    pendingVerifications.delete(email);

    res.status(200).json({
        success: true,
        message: 'Cuenta verificada correctamente.',
        username: record.username
    });
};