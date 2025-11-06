import { NextResponse } from "next/server";
import { buildSchema } from "@/app/lib/schemas";

export const dynamic = "force-dynamic"; // don't prerender this route
export const runtime = "nodejs";        // ensure Node runtime (not edge), ok for OpenAI SDK

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

Budget summary: parts ~$1,160 (DIY). Keep smog-legal in CA; no tune required.`

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = buildSchema.parse(body);

  const demo = process.env.DEMO_MODE === "1";
  const apiKey = process.env.OPENAI_API_KEY;

  // 👇 FREE path: always return mock when in demo or missing key
  if (demo || !apiKey) {
    return NextResponse.json({ result: MOCK_TEXT });
  }

  try {
    // Lazy-import OpenAI ONLY when we really need it
    const { default: OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are Build Buddy, an expert in car performance planning." },
        {
          role: "user",
          content: `Create a staged build plan for ${parsed.carModel} with a budget of ${parsed.budget} and goal ${parsed.goal}. Include brands, costs, tune yes/no, and a short budget summary.`,
        },
      ],
    });

    return NextResponse.json({ result: completion.choices[0].message.content });
  } catch (err: any) {
    return NextResponse.json({ error: "AI call failed", detail: err?.message }, { status: 500 });
  }
}
