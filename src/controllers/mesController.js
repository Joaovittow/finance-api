import { MesService } from '../services/mesService.js';

const mesService = new MesService();

export const getMeses = async (req, res, next) => {
  try {
    const meses = await mesService.getMeses();
    res.json(meses);
  } catch (error) {
    next(error);
  }
};

export const getMesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mes = await mesService.getMesById(id);
    res.json(mes);
  } catch (error) {
    next(error);
  }
};

export const createMes = async (req, res, next) => {
  try {
    const { ano, mes } = req.body;
    
    // Se não enviar ano/mes, criar o mês atual
    const anoParaCriar = ano || new Date().getFullYear();
    const mesParaCriar = mes || new Date().getMonth() + 1;
    
    const novoMes = await mesService.createMes(anoParaCriar, mesParaCriar);
    res.status(201).json(novoMes);
  } catch (error) {
    next(error);
  }
};

export const getMesAtual = async (req, res, next) => {
  try {
    const mesAtual = await mesService.getOuCriarMesAtual();
    res.json(mesAtual);
  } catch (error) {
    next(error);
  }
};

export const updateMes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const mesAtualizado = await mesService.updateMes(id, data);
    res.json(mesAtualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteMes = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mesService.deleteMes(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};