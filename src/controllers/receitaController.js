import { ReceitaService } from '../services/receitaService.js';

const receitaService = new ReceitaService();

const DATA_DEPOSITO_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const hojeYMDLocal = () => new Date().toLocaleDateString('sv-SE');

export const createReceita = async (req, res, next) => {
  try {
    const { mesId, descricao, valor, tipo, dataDeposito } = req.body;

    if (dataDeposito !== undefined && dataDeposito !== null) {
      if (typeof dataDeposito !== 'string' || !DATA_DEPOSITO_REGEX.test(dataDeposito)) {
        return res.status(400).json({ error: 'dataDeposito inválida. Use YYYY-MM-DD' });
      }
    }

    const tipoFinal =
      typeof tipo === 'string' && tipo.trim() !== '' ? tipo.trim() : undefined;
    const dataDepositoFinal =
      dataDeposito === undefined || dataDeposito === null ? hojeYMDLocal() : dataDeposito;

    const receita = await receitaService.createReceita({
      mesId,
      descricao,
      valor: parseFloat(valor),
      tipo: tipoFinal,
      dataDeposito: dataDepositoFinal
    });
    res.status(201).json(receita);
  } catch (error) {
    next(error);
  }
};

export const updateReceita = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { dataDeposito, tipo } = req.body;
    if (dataDeposito !== undefined) {
      if (typeof dataDeposito !== 'string' || !DATA_DEPOSITO_REGEX.test(dataDeposito)) {
        return res.status(400).json({ error: 'dataDeposito inválida. Use YYYY-MM-DD' });
      }
    }

    if (tipo !== undefined) {
      if (tipo === null) {
        return res.status(400).json({ error: 'tipo inválido' });
      }
      if (typeof tipo === 'string' && tipo.trim() === '') {
        req.body.tipo = 'fixa';
      }
    }

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