module.exports = async (req, res) => {
  // ✅ FIX CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ✅ Handle GET (browser test)
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
            content: `You are Sukoon Assistant, a calm and supportive guide for a recovery platform.

Keep responses:
- warm
- short
- non-judgmental

Ask one question at a time and guide users toward:
Sponsor Support, Specialist Sessions, Guided Recovery, or Family Support.

Do not diagnose or give medical advice.`
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
