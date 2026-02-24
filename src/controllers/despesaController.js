import { DespesaService } from '../services/despesaService.js';

const despesaService = new DespesaService();

export const createDespesa = async (req, res, next) => {
  try {
    const { 
      mesId, 
      descricao, 
      valorTotal, 
      parcelas, 
      categoria, 
      observacao,
      ehParcelada, 
      dataPrimeiraParcela,
      data
    } = req.body;
    
    const despesa = await despesaService.createDespesaComParcelas({
      mesId,
      descricao,
      valorTotal: parseFloat(valorTotal),
      parcelas: parseInt(parcelas),
      categoria,
      observacao,
      ehParcelada: ehParcelada || false,
      dataPrimeiraParcela: dataPrimeiraParcela || data,
      data
    });
    
    res.status(201).json(despesa);
  } catch (error) {
    next(error);
  }
};

export const updateDespesa = async (req, res, next) => {
  try {
    
    const { id } = req.params;
    const despesaAtualizada = await despesaService.updateDespesa(id, req.body);
    
    res.json(despesaAtualizada);
  } catch (error) {
    next(error);
  }
};

export const deleteDespesa = async (req, res, next) => {
  try {
    const { id } = req.params;
    await despesaService.deleteDespesa(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};