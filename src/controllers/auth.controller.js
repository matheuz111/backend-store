// src/controllers/auth.controller.js
import pool from '../db.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/* ── Registro ── */
export const registerController = async (req, res) => {
    const { username, email, password, phone } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, error: 'Todos los campos son requeridos.' });
    }
    if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const existing = await pool.query(
            'SELECT id FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ success: false, error: 'El usuario o correo ya existe.' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const result = await pool.query(
            'INSERT INTO users (username, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, username, email, phone, created_at',
            [username, email, hashedPassword, phone || null]
        );

        const user = result.rows[0];
        res.status(201).json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email, phone: user.phone },
        });
    } catch (err) {
        console.error('❌ Error en registro:', err.message);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};

/* ── Login ── */
export const loginController = async (req, res) => {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
        return res.status(400).json({ success: false, error: 'Usuario/email y contraseña son requeridos.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1 OR email = $1',
            [identifier]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
        }

        const user  = result.rows[0];
        const valid = await bcrypt.compare(password, user.password);

        if (!valid) {
            return res.status(401).json({ success: false, error: 'Usuario o contraseña incorrectos.' });
        }

        res.status(200).json({
            success: true,
            user: { id: user.id, username: user.username, email: user.email, phone: user.phone },
        });
    } catch (err) {
        console.error('❌ Error en login:', err.message);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};

/* ── Cambiar contraseña ── */
export const changePasswordController = async (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    if (!username || !currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Todos los campos son requeridos.' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
        }

        const user  = result.rows[0];
        const valid = await bcrypt.compare(currentPassword, user.password);

        if (!valid) {
            return res.status(401).json({ success: false, error: 'La contraseña actual es incorrecta.' });
        }

        const hashedNew = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await pool.query(
            'UPDATE users SET password = $1 WHERE username = $2',
            [hashedNew, username]
        );

        res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente.' });
    } catch (err) {
        console.error('❌ Error cambiando contraseña:', err.message);
        res.status(500).json({ success: false, error: 'Error interno del servidor.' });
    }
};