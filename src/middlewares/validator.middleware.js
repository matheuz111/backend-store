import Joi from 'joi';

const receiptSchema = Joi.object({
    email: Joi.string().email().required(),
    customerName: Joi.string().min(2).required(),
    orderId: Joi.string().alphanum().required(), 
    total: Joi.number().positive().required(),
    items: Joi.array().items(
        Joi.object({
            name: Joi.string().required(),
            price: Joi.number().min(0).required(),
            quantity: Joi.number().integer().min(1).required()
        })
    ).min(1).required()
});

export const validateReceipt = (req, res, next) => {
    const { error } = receiptSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};