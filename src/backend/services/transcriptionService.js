import axios from 'axios';

export const summarizeTranscription = async (text) => {
  try {
    const response = await axios.post('http://localhost:3001/summarize', { text });
    return response.data.choices[0].message.content;
  } catch (error) {
    throw new Error('Erro ao resumir transcrição');
  }
};