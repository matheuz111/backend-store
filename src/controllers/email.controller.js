import { sendEmail } from '../services/email.service.js';

export const sendReceiptController = async (req, res) => {
    const { email, customerName, orderId, total, items } = req.body;

    // Generar las filas de los items (Pavos, Skins, etc.)
    const itemsHtml = items.map(item => `
        <tr style="border-bottom: 1px solid #333333;">
            <td style="padding: 15px 12px; color: #e0e0e0; font-weight: bold;">${item.name}</td>
            <td style="padding: 15px 12px; color: #aaaaaa; text-align: center;">x${item.quantity}</td>
            <td style="padding: 15px 12px; color: #e0e0e0; text-align: right;">$ ${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    // Plantilla HTML Dark Mode - Fortnite Style
    const htmlContent = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0d0d; padding: 40px 10px; color: #ffffff;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; border: 1px solid #333; box-shadow: 0 10px 25px rgba(0,0,0,0.8);">
                
                <div style="background: linear-gradient(135deg, #7b2cbf 0%, #3a0ca3 100%); color: #ffffff; padding: 35px 20px; text-align: center;">
                    <h1 style="margin: 0; font-size: 26px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 2px 2px 4px rgba(0,0,0,0.6);">¡COMPRA CONFIRMADA!</h1>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #e0b0ff; letter-spacing: 1px;">Store Oficial - Fortnite Items</p>
                </div>
                
                <div style="padding: 35px 30px;">
                    <p style="font-size: 16px; line-height: 1.6; color: #e0e0e0;">Hola <strong>${customerName}</strong>,</p>
                    <p style="color: #aaaaaa; line-height: 1.6; font-size: 15px;">Tu recarga ha sido procesada con éxito y los items están en camino a tu inventario. Este es el resumen de tu orden de compra <strong>#${orderId}</strong>:</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 30px; margin-bottom: 30px; font-size: 15px;">
                        <thead>
                            <tr style="background-color: #242424; border-bottom: 2px solid #7b2cbf; text-align: left;">
                                <th style="padding: 15px 12px; color: #ffffff; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Item</th>
                                <th style="padding: 15px 12px; color: #ffffff; text-align: center; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Cant.</th>
                                <th style="padding: 15px 12px; color: #ffffff; text-align: right; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr style="background-color: #111111;">
                                <td colspan="2" style="padding: 20px 12px; text-align: right; font-weight: bold; font-size: 16px; color: #ffffff;">TOTAL ABONADO:</td>
                                <td style="padding: 20px 12px; text-align: right; font-weight: bold; font-size: 20px; color: #00ff88;">$ ${total.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    
                    <div style="background-color: #242424; border-left: 4px solid #7b2cbf; padding: 18px; border-radius: 0 8px 8px 0;">
                        <p style="margin: 0; color: #cccccc; font-size: 14px; line-height: 1.5;"><strong>🎮 Atención:</strong> Los V-Bucks o Pases de Batalla pueden tardar hasta 15 minutos en reflejarse. Asegúrate de reiniciar tu juego si estabas en el lobby.</p>
                    </div>
                </div>
                
                <div style="background-color: #0a0a0a; padding: 25px; text-align: center; border-top: 1px solid #222222;">
                    <p style="margin: 0; font-size: 12px; color: #555555;">© 2026 Tienda Fortnite. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    `;

    try {
        const result = await sendEmail(email, `Recibo de Compra #${orderId} - Tienda Fortnite`, htmlContent);
        res.status(200).json({ success: true, message: 'Recibo enviado con éxito', id: result.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};