import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import emailRoutes from './routes/email.routes.js'; 

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); 

app.get('/health', (req, res) => res.status(200).json({ status: 'up' }));

app.use('/', emailRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Microservicio de correos corriendo en el puerto ${PORT}`);
});