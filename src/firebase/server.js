const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DEEPSEEK_API_KEY = 'sk-4b67bda8d9ea4063a7c7b1dfa24e6bfa';

app.post('/summarize', async (req, res) => {
  try {
    const { text } = req.body;
    console.log('Texto recebido:', text);

    const response = await axios.post(
      'https://api.deepseek.com/chat/completions', // Endpoint corrigido
      {
        model: "deepseek-chat", // Adicione o campo `model`
        messages: [
          {
            role: "system",
            content: "Você é um assistente que resume textos."
          },
          {
            role: "user",
            content: `Resuma o seguinte texto, em bullet points. No idioma em que está.   : "${text}"`
          }
        ],
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Resposta da API da DeepSeek:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao chamar a API da DeepSeek:', error.response ? error.response.data : error.message);
    res.status(error.response ? error.response.status : 500).json({
      error: 'Erro ao chamar a API da DeepSeek',
      details: error.response ? error.response.data : error.message,
    });
  }
});

app.listen(3001, () => {
  console.log('Servidor rodando na porta 3001');
});