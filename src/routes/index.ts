import express from 'express';
import produtoRoutes from './produto.routes';

const app = express();
const hostname = '0.0.0.0';
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).send(
    'Olá! Minha API de Produtos no Codespaces está no ar 🚀'
  );
});

app.use('/produtos', produtoRoutes);

app.use((_req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada'
  });
});

app.listen(PORT, hostname, () => {
  console.log(`Servidor rodando e escutando na porta ${PORT}`);
});

export default app;