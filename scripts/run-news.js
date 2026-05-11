process.env.GEMINI_API_KEY = process.argv[2] || '';
process.env.GROQ_API_KEY = process.argv[3] || '';
process.env.CEREBRAS_API_KEY = process.argv[4] || '';
require('/root/.openclaw/workspace/windspot-pt/scripts/update-news.js');
