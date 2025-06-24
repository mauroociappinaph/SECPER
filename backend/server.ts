import express from 'express';
import cors from 'cors';
import router from './routes/routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware CORS
app.use(cors());

// Middleware para logs de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Uso del router modularizado
app.use(router);

app.get('/', (_req, res) => {
  res.send('Servidor de calendario funcionando');
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
