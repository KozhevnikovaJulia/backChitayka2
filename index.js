// const express = require('express')
// const bodyParser = require('body-parser')

// const app = express()
// const port = 4000
// const test = require('./routes/test')
// const pict = require('./routes/pict')
// const letters = require('./routes/letters')

// app.use(bodyParser.json())

// app.use('/pict', pict);
// app.use('/test', test);
// app.use('/letters', letters);

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })
require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const test = require('./routes/test');
const pict = require('./routes/pict');
const letters = require('./routes/letters');
const wordsRouter = require('./routes/words');

const app = express();
const port = process.env.PORT || 4000;
const prisma = new PrismaClient();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логирование запросов
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use('/words', wordsRouter);
app.use('/pict', pict);
app.use('/test', test);
app.use('/letters', letters);

app.get('/', (req, res) => {
  res.json({
    message: 'Chitayka Backend API',
    version: '1.0.0',
    endpoints: {
      words: {
        getAll: 'GET /words',
        getOne: 'GET /words/:id',
        add: 'POST /words',
        addSafe: 'POST /words/safe',
        addBulk: 'POST /words/bulk',
        update: 'PUT /words/:id',
        delete: 'DELETE /words/:id',
        search: 'GET /words/search/:query',
        byLevel: 'GET /words/level/:level',
      },
      health: 'GET /health',
      docs: 'GET /api-docs',
    },
  });
});

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Запуск сервера
async function startServer() {
  try {
    // Проверяем подключение к БД
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Запускаем сервер
    app.listen(port, () => {
      console.log(`✅ Server running on http://localhost:${port}`);
      console.log(`✅ Health check: http://localhost:${port}/health`);
      console.log(`✅ Words API: http://localhost:${port}/words`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
