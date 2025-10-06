import express from 'express';
import {
  createDespesa,
  updateDespesa,
  deleteDespesa
} from '../controllers/despesaController.js';

const router = express.Router();

router.post('/', createDespesa);
router.put('/:id', updateDespesa);
router.delete('/:id', deleteDespesa);

export default router;