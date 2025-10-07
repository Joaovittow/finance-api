// routes/mesRoutes.js
import express from 'express';
import {
  getMeses,
  getMesById,
  createMes,
  getMesAtual,
  updateMes,
  deleteMes
} from '../controllers/mesController.js';
import { authenticateToken } from '../controllers/userController.js'; // IMPORTE O MIDDLEWARE

const router = express.Router();

// Todas as rotas protegidas por autenticação
router.get('/', authenticateToken, getMeses);
router.get('/atual', authenticateToken, getMesAtual);
router.get('/:id', authenticateToken, getMesById);
router.post('/', authenticateToken, createMes);
router.put('/:id', authenticateToken, updateMes);
router.delete('/:id', authenticateToken, deleteMes);

export default router;