import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import mesRoutes from './routes/mesRoutes.js';
import quinzenaRoutes from './routes/quinzenaRoutes.js';
import receitaRoutes from './routes/receitaRoutes.js';
import despesaRoutes from './routes/despesaRoutes.js';
import parcelaRoutes from './routes/parcelaRoutes.js';
import userRoutes from './routes/userRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    'https://finance-interface-three.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Finance API is running' });
});

// Routes
app.use('/api/meses', mesRoutes);
app.use('/api/quinzenas', quinzenaRoutes);
app.use('/api/receitas', receitaRoutes);
app.use('/api/despesas', despesaRoutes);
app.use('/api/parcelas', parcelaRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});