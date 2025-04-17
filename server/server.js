
const express = require('express');

const app = express();

const PORT = 3001;

app.get('/api/status', (req, res) => {
    res.json({status: 'ok', message: 'Server is running'})
})

app.get('/', (req, res) => {
    res.json({status: 'ok', message: 'Server is running'})
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`API status endpoint available at http://localhost:${PORT}/api/status`);
  });