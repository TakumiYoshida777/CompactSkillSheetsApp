const express = require('express');
const app = express();

app.use(express.json());

app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works' });
});

app.post('/test-login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Test login successful',
    body: req.body 
  });
});

const PORT = 8001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});