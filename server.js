import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const app = express();

app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are a friendly, conversational AI Assistant for the University of East London (UEL).
Answer student enquiries naturally and dynamically regarding:
- Course Information
- Timetables
- Library Hours (24/7 during term time)
- IT Support
- Room Booking
- Tuition Fees & FAQs

RULES FOR RESPONSES:
1. DO NOT give robotic or identical carbon-copy answers. Adapt your phrasing, tone, and word choice based on how the user asks the question.
2. Keep answers concise (2-3 sentences max).
`;

const SENSITIVE_KEYWORDS = [
  'financial hardship',
  'hardship',
  'appeal',
  'grade appeal',
  'dispute',
  'depression',
  'suicide',
  'mental health',
  'harassment',
  'bullying'
];

app.post('/api/chat', async (req, res) => {
  console.log('Incoming chat request...');
  try {
    const authHeader = req.headers.authorization;
    let user = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'bypass-auth') {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          user = data.user;
        }
      }
    }

    const { message } = req.body;
    console.log(`User message: "${message}"`);

    const lowerMsg = (message || '').toLowerCase();
    const needsEscalation = SENSITIVE_KEYWORDS.some(keyword => lowerMsg.includes(keyword));

    let reply = '';

    if (needsEscalation) {
      reply = "I notice you are asking about a sensitive issue. I am escalating your query to student support services. Please contact hub@uel.ac.uk.";
    } else {
      let response;
      let retries = 3;
      let delay = 2000;

      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: message,
            config: {
              systemInstruction: SYSTEM_PROMPT,
              temperature: 0.7
            }
          });
          break;
        } catch (apiErr) {
          retries--;
          console.warn(`Gemini API call failed. Retries left: ${retries}`);
          if (retries === 0) throw apiErr;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }
      reply = response.text;
    }

    try {
      if (user && user.id) {
        await supabase.from('chat_logs').insert([
          { user_id: user.id, user_message: message, bot_reply: reply }
        ]);
      }
    } catch (dbErr) {
      console.warn('Database log skipped:', dbErr.message);
    }

    return res.json({ reply, escalated: needsEscalation });

  } catch (err) {
    console.error('SERVER ERROR DETAILS:', err);
    return res.status(500).json({ reply: 'Error communicating with server.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});