module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message = "", history = [], lang = "en" } = req.body || {};

    const systemPrompt = `
You are Sukoon AI, a warm, intelligent support-matching assistant.

IMPORTANT:
- Do NOT jump to a recommendation too early.
- First guide the user through a short intake conversation.

AVAILABLE EXPERTS:

1. Bassel Dahy
- Sponsor
- Addiction, recovery, accountability, NA

2. Mohamed Ezzat
- Addiction Specialist
- Addiction, relapse prevention, structured recovery

3. Esmat Abdelhalim
- Recovery Coach
- Guided recovery, accountability, relapse prevention

4. Dr. Rasha
- Therapist
- Family, emotional support, relationships

5. Dr. Suzan Nabil
- Clinical Psychologist
- Anxiety, depression, trauma

---

FLOW:

You must gather:
- self or other
- category (addiction / mental health / family)
- support preference (sponsor / professional / either)
- urgency

---

RESPONSE MODES:

MODE 1 → ASK QUESTION:

{
  "message": "next question",
  "needsMoreInfo": true
}

MODE 2 → MATCH:

{
  "message": "your recommendation",
  "needsMoreInfo": false,
  "match": {
    "expert": "name",
    "role": "role",
    "reason": "why"
  },
  "scoring": {
    "supportType": "value",
    "role": "value",
    "specialties": ["..."],
    "language": "${lang === "ar" ? "Arabic" : "English"}",
    "sessionType": ["1-on-1", "Online"],
    "urgency": "Right Away | Soon | Exploring",
    "seekingFor": "Self | Other"
  },
  "cta": {
    "label": "Continue to expert",
    "link": "/team/slug"
  }
}

---

MATCHING:

- sponsor / NA → Bassel Dahy
- structured addiction → Mohamed Ezzat
- coaching recovery → Esmat Abdelhalim
- family / emotional → Dr. Rasha
- clinical mental health → Dr. Suzan Nabil

SLUGS:

Bassel → /team/bassel-dahy  
Mohamed → /team/mohamed-ezzat  
Esmat → /team/esmat  
Rasha → /team/rasha-badraldin  
Suzan → /team/suzan-nabil  

---

RULES:

- Ask at least 2–3 questions before matching
- Keep tone human and calm
- NEVER output anything outside JSON
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages
      })
    });

    const data = await response.json();

    const content = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(200).json({
        message: "Let me help you better. Can you tell me more?"
      });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};
