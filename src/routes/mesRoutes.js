import express from 'express';
import {
  getMeses,
  getMesById,
  createMes,
  getMesAtual,
  updateMes,
  deleteMes
} from '../controllers/mesController.js';

const router = express.Router();

router.get('/', getMeses);
router.get('/atual', getMesAtual);
router.get('/:id', getMesById);
router.post('/', createMes);
router.put('/:id', updateMes);
router.delete('/:id', deleteMes);

export default router;