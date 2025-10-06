import express from 'express';
import {
  setupUser,
  getUserTest,
  getConfiguracoes,
  updateConfiguracao
} from '../controllers/userController.js';

const router = express.Router();

router.post('/setup', setupUser);
router.get('/test', getUserTest);
router.get('/configuracoes', getConfiguracoes);
router.put('/configuracoes/:chave', updateConfiguracao);

export default router;