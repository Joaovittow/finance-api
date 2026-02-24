import express from 'express';
import {
  marcarParcelaComoPaga,
  updateParcela,
  getParcelasPorMes
} from '../controllers/parcelaController.js';

const router = express.Router();

router.get('/mes/:mesId', getParcelasPorMes);
router.patch('/:id/pagar', marcarParcelaComoPaga);
router.put('/:id', updateParcela);

export default router;