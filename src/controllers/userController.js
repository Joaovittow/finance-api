import { UserService } from '../services/userService.js';

const userService = new UserService();

export const setupUser = async (req, res, next) => {
  try {
    const result = await userService.setupUser();
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserTest = async (req, res, next) => {
  try {
    const user = await userService.getUserTest();
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const getConfiguracoes = async (req, res, next) => {
  try {
    const configs = await userService.getConfiguracoes();
    res.json(configs);
  } catch (error) {
    next(error);
  }
};

export const updateConfiguracao = async (req, res, next) => {
  try {
    const { chave } = req.params;
    const { valor } = req.body;
    
    const config = await userService.updateConfiguracao(chave, valor);
    res.json(config);
  } catch (error) {
    next(error);
  }
};