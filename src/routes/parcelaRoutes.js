import express from 'express';
import {
  marcarParcelaComoPaga,
  updateParcela,
  getParcelasPorQuinzena
} from '../controllers/parcelaController.js';

const router = express.Router();

router.get('/quinzena/:quinzenaId', getParcelasPorQuinzena);
router.patch('/:id/pagar', marcarParcelaComoPaga);
router.put('/:id', updateParcela);

export default router;