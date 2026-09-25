import Produto, { ProdutoDados } from '../models/produto.model';

function validarDados(dados: ProdutoDados): { nome: string; preco: number } {
  if (!dados || typeof dados !== 'object') {
    throw new Error('Dados do produto são obrigatórios');
  }

  const nome = String(dados.nome || '').trim();
  const preco = Number(dados.preco);

  if (!nome) {
    throw new Error('Nome é obrigatório');
  }

  if (dados.preco === undefined || dados.preco === null) {
    throw new Error('Preço é obrigatório');
  }

  if (!Number.isFinite(preco) || preco < 0) {
    throw new Error('Preço deve ser um número maior ou igual a zero');
  }

  return { nome, preco };
}

export async function listar(): Promise<Produto[]> {
  return Produto.findAll({ order: [['id', 'ASC']] });
}

export async function buscarPorId(id: string): Promise<Produto | undefined> {
  const produtoId = Number(id);

  if (!Number.isInteger(produtoId) || produtoId <= 0) {
    return undefined;
  }

  return (await Produto.findByPk(produtoId)) || undefined;
}

export async function criar(dados: ProdutoDados): Promise<Produto> {
  return Produto.create(validarDados(dados));
}

export async function atualizar(
  id: string,
  dados: ProdutoDados
): Promise<Produto | undefined> {
  const produto = await buscarPorId(id);

  if (!produto) {
    return undefined;
  }

  const produtoDados = validarDados({
    nome: dados.nome === undefined ? produto.nome : dados.nome,
    preco: dados.preco === undefined ? produto.preco : dados.preco
  });

  await produto.update(produtoDados);
  return produto;
}

export async function remover(id: string): Promise<boolean> {
  const produto = await buscarPorId(id);

  if (!produto) {
    return false;
  }

  await produto.destroy();
  return true;
}