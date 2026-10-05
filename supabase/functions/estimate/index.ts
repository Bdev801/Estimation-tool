import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const ALLOWED_ORIGINS = new Set([
  "https://bdev801.github.io",
  "https://devcoconstructionllc.com",
  "https://www.devcoconstructionllc.com",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://bdev801.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Vary": "Origin",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function json(data: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin),
  });
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function textField(value: unknown, max = 4000) {
  return String(value ?? "").slice(0, max);
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, origin);
  }

  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "Origin not allowed" }, 403, origin);
  }

  const apiKey = Deno.env.get("ANTHROPIC_KEY");
  if (!apiKey) {
    return json({ error: "Estimator API is not configured" }, 503, origin);
  }

  try {
    const body = await req.json();
    const form = body?.form ?? {};
    const settings = body?.settings ?? {};

    const companyName = textField(settings.companyName, 120) || "Devco Construction LLC";
    const zip = textField(settings.zip, 20);
    const laborRate = clampNumber(settings.laborRate, 0, 500, 85);
    const markup = clampNumber(settings.markup, 0, 100, 25);

    const description = textField(form.description, 6000).trim();
    if (!description) {
      return json({ error: "Project description is required" }, 400, origin);
    }

    const system = `You are an expert construction estimator with 20+ years of experience working for ${companyName}.
Generate detailed, realistic construction estimates. Respond ONLY with valid JSON, no markdown, no extra text.
JSON structure:
{
  "projectTitle": "string",
  "summary": "string",
  "totalLow": number,
  "totalHigh": number,
  "duration": "string",
  "lineItems": [{"category":"string","description":"string","unit":"string","qty":number,"unitCost":number,"total":number}],
  "materialsList": [{"item":"string","qty":"string","estimatedCost":number}],
  "laborBreakdown": [{"trade":"string","hours":number,"rate":number,"total":number}],
  "scopeNotes": ["string"],
  "exclusions": ["string"],
  "assumptions": ["string"],
  "permitRequired": boolean,
  "permitEstimate": number
}`;

    const user = `Generate a construction estimate:
Client: ${textField(form.clientName, 200) || "TBD"}
Project Type: ${textField(form.projectType, 120) || "General Construction"}
Address: ${textField(form.address, 300) || "Not provided"}
ZIP: ${zip || "Not provided"}
Square Footage: ${textField(form.sqft, 80) || "Not provided"}
Timeline: ${textField(form.timeline, 200) || "Flexible"}
Labor Rate: $${laborRate}/hr
Markup: ${markup}%
Description: ${description}
Notes: ${textField(form.notes, 2000) || "None"}
Apply the ${markup}% markup to all costs. Use realistic current market pricing.`;

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: Deno.env.get("ANTHROPIC_MODEL") || "claude-sonnet-4-20250514",
        max_tokens: 1800,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    const payload = await upstream.json();
    if (!upstream.ok) {
      console.error("Anthropic error", upstream.status);
      return json({ error: "Estimator provider request failed" }, 502, origin);
    }

    const raw = payload?.content?.[0]?.text ?? "{}";
    const estimate = JSON.parse(String(raw).replace(/```json|```/g, "").trim());

    return json(estimate, 200, origin);
  } catch (error) {
    console.error("estimate error", error);
    return json({ error: "Unable to generate estimate" }, 500, origin);
  }
});
