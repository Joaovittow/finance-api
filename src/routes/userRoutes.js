// userRoutes.js
import express from 'express';
import {
  register,
  login,
  getProfile,
  setupUser,
  getConfiguracoes,
  updateConfiguracao,
  createConfiguracao,
  deleteConfiguracao,
  authenticateToken
} from '../controllers/userController.js';

const router = express.Router();

// Rotas públicas
router.post('/register', register);
router.post('/login', login);

// Rotas protegidas (requerem autenticação)
router.get('/profile', authenticateToken, getProfile);
router.post('/setup', authenticateToken, setupUser);
router.get('/configuracoes', authenticateToken, getConfiguracoes);
router.post('/configuracoes', authenticateToken, createConfiguracao);
router.put('/configuracoes/:chave', authenticateToken, updateConfiguracao);
router.delete('/configuracoes/:chave', authenticateToken, deleteConfiguracao);

export default router;