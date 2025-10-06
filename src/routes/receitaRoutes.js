import express from 'express';
import {
  createReceita,
  updateReceita,
  deleteReceita
} from '../controllers/receitaController.js';

const router = express.Router();

router.post('/', createReceita);
router.put('/:id', updateReceita);
router.delete('/:id', deleteReceita);

export default router;