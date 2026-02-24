import { ParcelaService } from '../services/parcelaService.js';

const parcelaService = new ParcelaService();

export const getParcelasPorMes = async (req, res, next) => {
  try {
    const { mesId } = req.params;
    const parcelas = await parcelaService.getParcelasPorMes(mesId);
    res.json(parcelas);
  } catch (error) {
    next(error);
  }
};

export const marcarParcelaComoPaga = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { valorPago } = req.body;
    
    const parcela = await parcelaService.marcarComoPaga(id, valorPago);
    res.json(parcela);
  } catch (error) {
    next(error);
  }
};

export const updateParcela = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const parcelaAtualizada = await parcelaService.updateParcela(id, data);
    res.json(parcelaAtualizada);
  } catch (error) {
    next(error);
  }
};