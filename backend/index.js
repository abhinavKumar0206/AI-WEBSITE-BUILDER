// backend/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const generateRoute = require('./routes/generate'); // ✅ Import your route

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Mount the route correctly at /generate
app.use('/', generateRoute);

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
