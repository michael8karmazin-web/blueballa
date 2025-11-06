import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSchema } from "@/app/lib/schemas";

const MOCK_TEXT = `Stage 0.5 — Baseline & Flow
- NGK Iridium plugs ($48)
- AEM drop-in panel filter ($60)
- CRC MAF cleaner, throttle body clean
Est. gain: +3–5 whp | Cost: ~$120

Stage 1 — Breathing & Response
- Cat-back exhaust (quiet) — CorkSport (~$550)
- Lightweight crank pulley (~$250)
Est. gain: +8–12 whp | Cost: ~$800

Stage 1+ — Feel
- Rear motor mount (CorkSport) — $180
- Short-shift plate/bushings — $60
Est. gain: response only | Cost: ~$240

Budget summary: parts ~$1,160 (DIY). Keep smog-legal in CA; no tune required.`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = buildSchema.parse(body);

    // DEMO: if no key or demo mode set, return a mock plan
    if (!process.env.OPENAI_API_KEY || process.env.DEMO_MODE === "1") {
      return NextResponse.json({ result: MOCK_TEXT });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are Build Buddy, an expert in car performance planning. Be specific and conservative for daily drivers; prefer smog-legal options for CA." },
        { role: "user", content: `Create a staged build plan for a ${parsed.carModel} with a budget of ${parsed.budget} and goal of ${parsed.goal}. List stages, parts, brands, est. costs, if tune required, and a short budget summary.` }
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (err: any) {
    // Friendly error for quota/rate limit
    if (err?.status === 429 || /quota/i.test(err?.message || "")) {
      return NextResponse.json({
        error: "OpenAI quota exceeded (429). Add credits in your OpenAI billing or enable DEMO_MODE=1 on Vercel.",
      }, { status: 429 });
    }
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
