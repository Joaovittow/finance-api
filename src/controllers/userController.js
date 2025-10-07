import { UserService } from '../services/userService.js';
import jwt from 'jsonwebtoken';

const userService = new UserService();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'seu_jwt_secret_aqui', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, nome e senha são obrigatórios' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const result = await userService.registerUser(email, name, password);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const result = await userService.loginUser(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getCurrentUser(req.user.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const setupUser = async (req, res, next) => {
  try {
    const result = await userService.setupUser(req.user.userId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getConfiguracoes = async (req, res, next) => {
  try {
    const configs = await userService.getConfiguracoes(req.user.userId);
    res.json(configs);
  } catch (error) {
    next(error);
  }
};

export const updateConfiguracao = async (req, res, next) => {
  try {
    const { chave } = req.params;
    const { valor } = req.body;
    
    console.log('Atualizando configuração:', { chave, valor, userId: req.user.userId });
    
    const config = await userService.updateConfiguracao(req.user.userId, chave, valor);
    res.json(config);
  } catch (error) {
    console.error('Erro no updateConfiguracao:', error);
    next(error);
  }
};

export const createConfiguracao = async (req, res, next) => {
  try {
    const { chave, valor, descricao } = req.body;
    
    if (!chave || !valor || !descricao) {
      return res.status(400).json({ error: 'Chave, valor e descrição são obrigatórios' });
    }

    const config = await userService.createConfiguracao(req.user.userId, chave, valor, descricao);
    res.status(201).json(config);
  } catch (error) {
    next(error);
  }
};

export const deleteConfiguracao = async (req, res, next) => {
  try {
    const { chave } = req.params;
    await userService.deleteConfiguracao(req.user.userId, chave);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};