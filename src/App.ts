import express from 'express';
import produtoRoutes from './routes/produto.routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    mensagem: 'API de Produtos funcionando'
  });
});

app.use('/produtos', produtoRoutes);

app.use((_req, res) => {
  res.status(404).json({
    mensagem: 'Rota não encontrada'
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

export default app;