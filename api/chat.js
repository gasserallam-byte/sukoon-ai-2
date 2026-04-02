export default async function handler(req, res) {
  try {
    const { message, history = [] } = req.body;

    const systemPrompt = `
You are Sukoon AI — a smart assistant that MATCHES users to the right expert.

You must ALWAYS:
1. Understand the need
2. Choose the best expert
3. Respond naturally
4. Return JSON ONLY

---

EXPERTS:

1. Bassel Dahy
- Sponsor
- Addiction, recovery, accountability, NA
- Best for: sponsorship, early recovery

2. Dr. Suzan Nabil
- Clinical Psychologist
- Mental health, trauma, anxiety
- Best for: deep therapy

3. Dr. Rasha
- Therapist
- Emotional support, relationships, family
- Best for: general support

---

MATCH RULES:

Addiction / recovery → Bassel  
Clinical / trauma → Suzan  
General / emotional → Rasha  

---

OUTPUT FORMAT (STRICT JSON):

{
  "message": "your natural response",
  "match": {
    "expert": "name",
    "role": "role",
    "reason": "why"
  },
  "cta": {
    "label": "Continue to X",
    "link": "/team/slug"
  }
}

NO TEXT OUTSIDE JSON
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    const reply = data.choices?.[0]?.message?.content;

    let parsed;

    try {
      parsed = JSON.parse(reply);
    } catch (e) {
      return res.status(200).json({
        message: reply || "Let me help you find the right support."
      });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      message: "Server error"
    });
  }
}
