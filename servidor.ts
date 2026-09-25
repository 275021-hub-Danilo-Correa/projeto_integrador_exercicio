import app from './src/App';
import { inicializarBanco } from './src/database/database';

const hostname = '0.0.0.0';
const PORT = 3000;

inicializarBanco()
  .then(() => {
    app.listen(PORT, hostname, () => {
      console.log(`Servidor rodando e escutando na porta ${PORT}`);
    });
  })
  .catch((error: unknown) => {
    console.error('Não foi possível inicializar o banco de dados', error);
    process.exit(1);
  });