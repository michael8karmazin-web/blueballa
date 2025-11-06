import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildSchema } from "@/app/lib/schemas";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = buildSchema.parse(body);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are Build Buddy, an expert in car performance tuning and modification planning.",
        },
        {
          role: "user",
          content: `Create a build plan for a ${parsed.carModel} with a budget of ${parsed.budget} and goal of ${parsed.goal}. Include key mods, brands, and estimated costs.`,
        },
      ],
    });

    return NextResponse.json({
      result: completion.choices[0].message.content,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
