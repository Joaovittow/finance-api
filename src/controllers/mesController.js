// controllers/mesController.js
import { MesService } from '../services/mesService.js';

const mesService = new MesService();

export const getMeses = async (req, res, next) => {
  try {
    const meses = await mesService.getMeses(req.user.userId);
    res.json(meses);
  } catch (error) {
    next(error);
  }
};

export const getMesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mes = await mesService.getMesById(id, req.user.userId);
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
    
    const novoMes = await mesService.createMes(anoParaCriar, mesParaCriar, req.user.userId);
    res.status(201).json(novoMes);
  } catch (error) {
    next(error);
  }
};

export const getMesAtual = async (req, res, next) => {
  try {
    const mesAtual = await mesService.getOuCriarMesAtual(req.user.userId);
    res.json(mesAtual);
  } catch (error) {
    next(error);
  }
};

export const updateMes = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const mesAtualizado = await mesService.updateMes(id, data, req.user.userId);
    res.json(mesAtualizado);
  } catch (error) {
    next(error);
  }
};

export const deleteMes = async (req, res, next) => {
  try {
    const { id } = req.params;
    await mesService.deleteMes(id, req.user.userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};