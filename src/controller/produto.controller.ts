import { Request, Response } from 'express';
import * as produtoService from '../services/produto.services';

function idDaRota(req: Request): string {
  return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
}

function mensagemDoErro(error: unknown): string {
  return error instanceof Error ? error.message : 'Erro ao processar produto';
}

async function listar(_req: Request, res: Response) {
  const produtos = await produtoService.listar();

  return res.status(200).json(produtos);
}

async function buscarPorId(req: Request, res: Response) {
  const produto = await produtoService.buscarPorId(idDaRota(req));

  if (!produto) {
    return res.status(404).json({ mensagem: 'Produto não encontrado' });
  }

  return res.status(200).json(produto);
}

async function criar(req: Request, res: Response) {
  try {
    const produto = await produtoService.criar(req.body);

    return res.status(201).json(produto);
  } catch (error: unknown) {
    return res.status(400).json({ mensagem: mensagemDoErro(error) });
  }
}

async function atualizar(req: Request, res: Response) {
  try {
    const produto = await produtoService.atualizar(idDaRota(req), req.body);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(produto);
  } catch (error: unknown) {
    return res.status(400).json({ mensagem: mensagemDoErro(error) });
  }
}

async function remover(req: Request, res: Response) {
  const removido = await produtoService.remover(idDaRota(req));

  if (!removido) {
    return res.status(404).json({ mensagem: 'Produto não encontrado' });
  }

  return res.status(204).send();
}

export default {
  listar,
  buscarPorId,
  criar,
  atualizar,
  remover
};
