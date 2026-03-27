module.exports = async (req, res) => {
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
            content: `You are Sukoon Assistant, a calm and supportive guide for a recovery support platform.

Your role is to:
- help users feel safe and understood
- ask gentle questions to understand their situation
- guide them toward the right type of support

Rules:
- do not diagnose
- do not give medical advice
- do not act as a therapist
- keep responses short, calm, and human
- ask one question at a time

Possible recommendations:
- Sponsor Support
- Specialist Sessions
- Guided Recovery
- Family Support`
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
    stack: error.stack
  });
}
