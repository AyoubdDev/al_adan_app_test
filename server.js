import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = 3000;

app.use(cors());


app.use('/test_app_adan', async (req, res) => {
  try {
    const apiUrl = `http://api.aladhan.com/v1${req.originalUrl.replace('/test_app_adan', '')}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erreur de proxy', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur proxy lancé sur http://localhost:${PORT}`);
});
