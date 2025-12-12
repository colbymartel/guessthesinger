const { onRequest } = require("firebase-functions/v2/https");

const allowedOrigins = [
  "http://127.0.0.1:5509",
  "http://localhost:5509",
  "https://guessthesinger.com",
];

// --- helper: clean model output into parsable JSON ---
function cleanToJsonString(raw) {
  if (!raw) return "";

  let s = String(raw).trim();

  // Remove markdown fences ```json ... ```
  s = s.replace(/```json/gi, "```");
  s = s.replace(/```/g, "").trim();

  // Replace invalid JSON token "unknown" with null (only when used as a value)
  // Examples:
  //   "isYes": unknown   -> "isYes": null
  //   :unknown           -> :null
  s = s.replace(/:\s*unknown\b/gi, ": null");

  return s;
}

// --- helper: if extra text surrounds JSON, extract the first {...} block ---
function extractFirstJsonObject(raw) {
  const s = String(raw);
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return s.slice(start, end + 1);
}

exports.generateAnswers = onRequest(
  { secrets: ["OPENAI_API_KEY"] },
  async (req, res) => {
    // --- CORS ---
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.set("Access-Control-Allow-Origin", origin);
    }
    res.set("Vary", "Origin"); // important when reflecting origin
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );

    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("OPENAI_API_KEY missing at runtime");
        return res.status(500).json({ error: "Missing OPENAI_API_KEY" });
      }

      const { artistName, questionKeys } = req.body || {};
      if (!artistName || !Array.isArray(questionKeys)) {
        return res
          .status(400)
          .json({ error: "artistName and questionKeys are required" });
      }

      const prompt = `
You are helping build a yes/no guessing game about music artists.

Artist: ${artistName}

For each question, answer with:
- isYes: true / false / null (null = unknown)
- answerText: a short explanation sentence shown to the player

Questions:
${questionKeys.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return JSON ONLY (no backticks, no extra text). Exact shape:
{
  "answers": {
    "QUESTION_TEXT_HERE": { "isYes": true/false/null, "answerText": "short explanation" }
  }
}
      `.trim();

      // Call OpenAI
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });

      const bodyText = await r.text(); // raw response text (debuggable)

      if (!r.ok) {
        console.error("OpenAI non-OK:", r.status, bodyText);
        return res.status(500).json({
          error: "OpenAI API error",
          status: r.status,
          body: bodyText,
        });
      }

      // Parse OpenAI JSON response
      let openai;
      try {
        openai = JSON.parse(bodyText);
      } catch (e) {
        console.error("OpenAI returned non-JSON:", bodyText);
        return res
          .status(500)
          .json({ error: "OpenAI returned non-JSON", body: bodyText });
      }

      const content = openai?.choices?.[0]?.message?.content;
      if (!content) {
        console.error("No content in OpenAI response:", openai);
        return res
          .status(500)
          .json({ error: "No content from OpenAI", raw: openai });
      }

      // Clean + parse model JSON
      let cleaned = cleanToJsonString(content);

      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e1) {
        // Last-resort: extract first JSON object and try again
        const extracted = extractFirstJsonObject(cleaned) || extractFirstJsonObject(content);
        if (extracted) {
          const cleaned2 = cleanToJsonString(extracted);
          try {
            parsed = JSON.parse(cleaned2);
          } catch (e2) {
            console.error("Failed to parse after extraction:", cleaned2);
            return res.status(500).json({
              error: "AI response not valid JSON",
              content: content,
              cleaned: cleaned2,
            });
          }
        } else {
          console.error("Failed to parse model JSON:", cleaned);
          return res.status(500).json({
            error: "AI response not valid JSON",
            content: content,
            cleaned,
          });
        }
      }

      // Sanity check shape
      if (!parsed || typeof parsed !== "object" || !parsed.answers) {
        return res.status(500).json({
          error: "AI JSON missing `answers` key",
          parsed,
        });
      }

      return res.json(parsed);
    } catch (err) {
      console.error("FUNCTION CRASH:", err?.stack || err);
      return res.status(500).json({
        error: "Server error",
        details: String(err?.message || err),
      });
    }
  }
);
