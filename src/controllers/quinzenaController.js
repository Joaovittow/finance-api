import { QuinzenaService } from '../services/quinzenaService.js';

const quinzenaService = new QuinzenaService();

export const getQuinzenaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const quinzena = await quinzenaService.getQuinzenaById(id);
    res.json(quinzena);
  } catch (error) {
    next(error);
  }
};

export const getQuinzenaCalculos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const calculos = await quinzenaService.getCalculosQuinzena(id);
    res.json(calculos);
  } catch (error) {
    next(error);
  }
};

export const updateQuinzena = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const quinzenaAtualizada = await quinzenaService.updateQuinzena(id, data);
    res.json(quinzenaAtualizada);
  } catch (error) {
    next(error);
  }
};