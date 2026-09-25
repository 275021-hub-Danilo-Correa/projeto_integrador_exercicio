import request from 'supertest';
import app from '../App';
import { sequelize, inicializarBanco } from '../database/database';

beforeEach(async () => {
  await sequelize.sync({ force: true });
  await inicializarBanco();
});

afterAll(async () => {
  await sequelize.close();
});

describe('CRUD de produtos', () => {
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
});
