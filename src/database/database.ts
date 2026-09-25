import { Sequelize } from 'sequelize';
import Produto from '../models/produto.model';

const storage = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : process.env.DB_STORAGE || 'database.sqlite';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

export async function inicializarBanco(): Promise<void> {
  await sequelize.sync();

  if (await Produto.count() === 0) {
    await Produto.bulkCreate([
      { nome: 'Notebook', preco: 3500 },
      { nome: 'Mouse', preco: 120 }
    ]);
  }
}