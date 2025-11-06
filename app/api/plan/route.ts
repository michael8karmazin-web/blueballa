import { NextResponse } from "next/server";

// If you already have zod validation (buildSchema), keep it. Otherwise we'll accept whatever comes in.
type Input = { carModel?: string; budget?: string; goal?: string };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: Input = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const carModel = body.carModel ?? "Unknown car";
  const budget = body.budget ?? "$1500";
  const goal = body.goal ?? "daily driver power & reliability";

  // ---------- 1) FREE: Use local Ollama if available ----------
  if (process.env.OLLAMA_URL) {
    try {
      const system =
        "You are Build Buddy, a cautious tuner AI for street-driven cars. " +
        "Always respect smog legality when mentioned, avoid sketchy mods, and be realistic with gains and costs. " +
        "Return clear STAGES with parts, brands, rough prices, whether tune is required, and legality notes.";

      const user = `Create a staged build plan for: ${carModel}
Budget: ${budget}
Goal: ${goal}

Please include:
- Stage 0.5 baseline items (plugs, fluids/filters if applicable)
- Stage 1 breathing/response (intake, cat-back, safe items)
- Stage 1+ mounts/brakes/suspension/tires if budget allows
- Note which items require a tune, and which are CARB legal / smog-safe`;

      // Chat endpoint is easiest:
      const resp = await fetch(`${process.env.OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          stream: false,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`Ollama error ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      const text =
        data?.message?.content ||
        data?.choices?.[0]?.message?.content ||
        "No response from local model.";
      return NextResponse.json({ result: text });
    } catch (e: any) {
      // Fall through to demo if Ollama fails
      console.error("OLLAMA ERROR:", e?.message || e);
    }
  }

  // ---------- 2) FREE: Demo fallback (CSV/mock if you added it) ----------
  if (process.env.DEMO_MODE === "1" || !process.env.OPENAI_API_KEY) {
    const text = `DEMO MODE\n\nCar: ${carModel}\nBudget: ${budget}\nGoal: ${goal}\n\nStage 0.5: plugs/filters\nStage 1: intake + cat-back\nStage 1+: RMM + pads/lines\n\n(Enable OLLAMA_URL to get real AI locally.)`;
    return NextResponse.json({ result: text });
  }

  // ---------- 3) PAID: OpenAI fallback (if you later enable it) ----------
  try {
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            "You are Build Buddy, a cautious tuner AI for street-driven cars.",
        },
        {
          role: "user",
          content: `Create a staged build plan for ${carModel} with budget ${budget} and goal ${goal}.`,
        },
      ],
    });
    const text = completion.choices[0].message.content || "No response.";
    return NextResponse.json({ result: text });
  } catch (e: any) {
    return NextResponse.json(
      { error: `AI error: ${e?.message || e}` },
      { status: 500 }
    );
  }
}
