import request from 'supertest';
import app from '../App';
import { sequelize, inicializarBanco } from '../database/database';
import Produto from '../models/produto.model';

beforeEach(async () => {
  await sequelize.sync({ force: true });
  await inicializarBanco();
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD de produtos', () => {
  it('responde a rota raiz da API', async () => {
    const resposta = await request(app).get('/');
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({
      mensagem: 'API de Produtos funcionando'
    });
  });

  it('retorna 404 para rotas inexistentes', async () => {
    const resposta = await request(app).get('/rota-inexistente');
    expect(resposta.status).toBe(404);
    expect(resposta.body).toEqual({
      mensagem: 'Rota não encontrada'
    });
  });

  it('lista, busca e retorna erro para produto inexistente', async () => {
    const lista = await request(app).get('/produtos');
    expect(lista.status).toBe(200);
    expect(lista.body).toHaveLength(2);

    const encontrado = await request(app).get('/produtos/1');
    expect(encontrado.status).toBe(200);
    expect(encontrado.body.nome).toBe('Notebook');

    const inexistente = await request(app).get('/produtos/999');
    expect(inexistente.status).toBe(404);

    const idInvalido = await request(app).get('/produtos/invalido');
    expect(idInvalido.status).toBe(404);
  });

  it('cria um produto', async () => {
    const resposta = await request(app)
      .post('/produtos')
      .send({ nome: 'Teclado', preco: 180 });

    expect(resposta.status).toBe(201);
    expect(resposta.body).toMatchObject({ nome: 'Teclado', preco: 180 });
  });

  it.each([
    [{ nome: '', preco: 10 }, 'Nome é obrigatório'],
    [{ nome: 'Produto' }, 'Preço é obrigatório'],
    [{ nome: 'Produto', preco: -1 }, 'Preço deve ser um número maior ou igual a zero'],
    [null, 'Dados do produto são obrigatórios']
  ])('rejeita dados inválidos: %j', async (dados, mensagem) => {
    const resposta = await request(app).post('/produtos').send(dados as object);

    expect(resposta.status).toBe(400);
    expect(resposta.body.mensagem).toBe(mensagem);
  });

  it('atualiza um produto existente e rejeita id inexistente', async () => {
    const atualizado = await request(app)
      .put('/produtos/1')
      .send({ nome: 'Notebook Pro', preco: 4500 });

    expect(atualizado.status).toBe(200);
    expect(atualizado.body).toMatchObject({ nome: 'Notebook Pro', preco: 4500 });

    const atualizadoParcialNome = await request(app)
      .put('/produtos/1')
      .send({ nome: 'Notebook Gamer' });

    expect(atualizadoParcialNome.status).toBe(200);
    expect(atualizadoParcialNome.body).toMatchObject({ nome: 'Notebook Gamer', preco: 4500 });

    const atualizadoParcialPreco = await request(app)
      .put('/produtos/1')
      .send({ preco: 5000 });

    expect(atualizadoParcialPreco.status).toBe(200);
    expect(atualizadoParcialPreco.body).toMatchObject({ nome: 'Notebook Gamer', preco: 5000 });

    const inexistente = await request(app)
      .put('/produtos/999')
      .send({ nome: 'Produto', preco: 10 });

    expect(inexistente.status).toBe(404);
  });

  it('rejeita atualização inválida', async () => {
    const resposta = await request(app)
      .put('/produtos/1')
      .send({ nome: '', preco: 10 });

    expect(resposta.status).toBe(400);
    expect(resposta.body.mensagem).toBe('Nome é obrigatório');
  });

  it('remove um produto e retorna erro quando ele não existe', async () => {
    const removido = await request(app).delete('/produtos/2');
    expect(removido.status).toBe(204);

    const inexistente = await request(app).delete('/produtos/2');
    expect(inexistente.status).toBe(404);
  });

  it('verifica método estaEmPromocao do modelo Produto', () => {
    const produtoCaro = Produto.build({ nome: 'Cadeira Gamer', preco: 250 });
    const produtoBarato = Produto.build({ nome: 'Mousepad', preco: 49.9 });

    expect(produtoCaro.estaEmPromocao()).toBe(false);
    expect(produtoBarato.estaEmPromocao()).toBe(true);
  });
});

