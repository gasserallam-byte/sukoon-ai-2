module.exports = async (req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Handle browser GET requests for testing
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Sukoon chat endpoint is live. Use POST to chat."
    });
  }

  try {
    const { messages } = req.body || {};

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
You are Sukoon Assistant, a calm, human-like recovery guide.

Your goal:
Help users understand what kind of support they need and guide them to the right service.

CONVERSATION RULES:
- Never repeat the same sentence
- Always move the conversation forward
- Ask ONE clear question at a time
- Be warm, natural, and human
- Keep responses short (1–2 sentences max)

FLOW:
1. Understand the situation
2. Identify the need
3. Guide toward a service

IF USER SAYS:
- "I feel lost" → ask what’s been weighing on them
- "I need help" → ask what kind of help they’re looking for
- "I’m not sure" → offer 2–3 gentle options to choose from

AVAILABLE SUPPORT TYPES:
- Talking to a specialist
- Sponsor / peer support
- Structured recovery program
- Family guidance

IMPORTANT:
- Do NOT give medical advice
- Do NOT diagnose
- Do NOT sound robotic
- Speak like a calm, caring human

EXAMPLES:

User: I feel lost
Assistant: I’m really glad you reached out. What’s been feeling the heaviest for you lately?

User: I need help
Assistant: I’m here with you. Is this more about something emotional, habits you want to change, or support from others?

User: I’m not sure
Assistant: That’s okay. We can figure it out together. Does it feel more like stress, something you’re trying to stop, or just needing someone to talk to?
`
          },
          ...(messages || [])
        ]
      })
    });

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message,
      full: error
    });
  }
};
