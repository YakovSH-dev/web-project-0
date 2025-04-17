
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const PORT = process.env.PORT || 3001;

app.get('/api/status', (req, res) => {
    res.json({status: 'ok', message: 'Server is running'})
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`API status endpoint potentially available at /api/status relative to the server base URL`);
  });