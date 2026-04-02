module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      message: "Sukoon chat endpoint is live. Use POST to chat."
    });
  }

  try {
    const { message = "", history = [], lang = "en", userName = "" } = req.body || {};

    const systemPrompt = `
You are Sukoon AI, a warm and emotionally safe support-matching assistant.

You must ALWAYS return valid JSON only.

AVAILABLE EXPERTS:

1. Bassel Dahy
- role: Sponsor
- best for: sponsor support, accountability, lived experience, NA-style guidance, addiction recovery

2. Mohamed Ezzat
- role: Addiction Specialist
- best for: addiction, recovery, relapse prevention, structured support

3. Atef
- role: Recovery Coach
- best for: guided recovery, addiction support, relapse prevention, accountability

4. Dr. Rasha
- role: Therapist
- best for: family support, emotional support, relationship issues, general therapy

5. Dr. Suzan Nabil
- role: Clinical Psychologist
- best for: anxiety, depression, trauma, deeper clinical mental health support

GOAL:
Understand the user and return a decisive recommendation.

LANGUAGE:
- If lang = "ar", reply in Arabic
- If lang = "en", reply in English

RETURN THIS EXACT JSON SHAPE:

{
  "message": "natural response to the user",
  "match": {
    "expert": "expert full name",
    "role": "role",
    "reason": "short reason"
  },
  "scoring": {
    "supportType": "Sponsor Support or Guided Recovery or Specialist Sessions or Family Support",
    "role": "Sponsor or Addiction Specialist or Recovery Coach or Therapist or Clinical Psychologist",
    "specialties": ["Specialty1", "Specialty2"],
    "language": "Arabic or English",
    "sessionType": ["1-on-1", "Online"],
    "urgency": "Right Away or Soon or Exploring",
    "seekingFor": "Self or Other"
  },
  "cta": {
    "label": "Continue to expert",
    "link": "/team/expert-slug"
  }
}

EXPERT SLUGS:
- Bassel Dahy -> /team/bassel-dahy
- Mohamed Ezzat -> /team/mohamed-ezzat
- Atef -> /team/esmat
- Dr. Rasha -> /team/rasha-badraldin
- Dr. Suzan Nabil -> /team/suzan-nabil

MATCHING RULES:
- sponsor / lived experience / NA / accountability -> Bassel Dahy
- structure / relapse prevention / guided recovery -> Atef or Mohamed Ezzat
- addiction therapy / behavioral addiction support -> Mohamed Ezzat
- family / loved one / family conflict -> Dr. Rasha
- anxiety / depression / trauma / deeper mental health -> Dr. Suzan Nabil

IMPORTANT:
- Always decide.
- Never return plain text outside JSON.
- If unsure between Atef and Mohamed, prefer Mohamed for therapy/professional tone, Atef for coaching/guided recovery tone.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...history,
      ...(message ? [{ role: "user", content: message }] : [])
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: data?.error?.message || "OpenAI request failed",
        details: data
      });
    }

    const content = data?.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "AI returned invalid JSON",
        raw: content
      });
    }

    if (!parsed.message) {
      return res.status(500).json({
        ok: false,
        error: "AI JSON missing message field",
        raw: parsed
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      error: error.message || "Unknown server error"
    });
  }
};
