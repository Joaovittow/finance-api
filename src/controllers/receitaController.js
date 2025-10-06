import { ReceitaService } from '../services/receitaService.js';

const receitaService = new ReceitaService();

export const createReceita = async (req, res, next) => {
  try {
    const { quinzenaId, descricao, valor, tipo } = req.body;
    const receita = await receitaService.createReceita({
      quinzenaId,
      descricao,
      valor: parseFloat(valor),
      tipo
    });
    res.status(201).json(receita);
  } catch (error) {
    next(error);
  }
};

export const updateReceita = async (req, res, next) => {
  try {
    const { id } = req.params;
    const receitaAtualizada = await receitaService.updateReceita(id, req.body);
    res.json(receitaAtualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteReceita = async (req, res, next) => {
  try {
    const { id } = req.params;
    await receitaService.deleteReceita(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};