const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/orders', (req, res) => res.status(200).json([]));
app.post('/orders', (req, res) => res.status(201).json({ id: 1 }));
app.put('/orders/1', (req, res) => res.status(200).json({}));
app.get('/products', (req, res) => res.status(200).json([]));
app.post('/products', (req, res) => res.status(201).json({ id: 1 }));
app.put('/products/1', (req, res) => res.status(200).json({}));
app.get('/tasks', (req, res) => res.status(200).json([]));
app.post('/tasks', (req, res) => res.status(201).json({ id: 1 }));
app.put('/tasks/1', (req, res) => res.status(200).json({}));
app.post('/tasks/1/start', (req, res) => res.status(200).json({}));
app.post('/tasks/1/assign', (req, res) => res.status(200).json({}));
app.get('/catalog', (req, res) => res.status(200).json([]));
app.get('/catalog/1', (req, res) => res.status(200).json({}));
app.get('/tasks/previous', (req, res) => res.status(200).json([]));

const server = app.listen(3000, () => console.log('Mock API listening on port 3000'));

// Graceful shutdown
process.on('SIGTERM', () => server.close(() => process.exit(0)));
