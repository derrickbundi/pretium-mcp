const QVAC_BASE_URL = process.env.QVAC_URL || 'http://localhost:11434';

const response = await axios.post(`${QVAC_BASE_URL}/v1/chat/completions`, {
  model: 'your-loaded-model-id',
  messages: [
    { role: 'system', content: 'You are a Pretium payment assistant.' },
    { role: 'user',   content: userMessage },
  ],
  stream: false,
});

const reply = response.data.choices[0].message.content;