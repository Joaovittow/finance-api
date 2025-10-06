import express from 'express';
import {
  getQuinzenaById,
  updateQuinzena,
  getQuinzenaCalculos
} from '../controllers/quinzenaController.js';

const router = express.Router();

router.get('/:id', getQuinzenaById);
router.get('/:id/calculos', getQuinzenaCalculos);
router.put('/:id', updateQuinzena);

export default router;