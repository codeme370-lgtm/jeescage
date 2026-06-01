import authAdmin from "@/middlewares/authAdmin";
import { getSessionUserId } from "@/lib/authHelpers";
import { NextResponse } from "next/server";
import { openai } from "@/configs/openai";

async function main(base64Image, mimeType) {
  const messages = [
    {
      role: "system",
      content: `
You are a product listing assistant for an e-commerce store.
Your job is to analyze an image of a product and generate structured data.

Respond ONLY with raw JSON (no markdown, no explanation).
Schema:
{
  "name": string,
  "description": string
}
      `,
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "Analyze this image and return name + description.",
        },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`,
          },
        },
      ],
    },
  ];

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL,
    messages,
  });

  if (!response || !response.choices || response.choices.length === 0) {
    const err = new Error('OpenAI returned no choices');
    // attach response for debugging
    err.response = response;
    throw err;
  }

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("AI did not return valid JSON");
  }
}

export async function POST(request) {
  try {
    const userId = getSessionUserId(request);

    const isAdmin = await authAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Not authorized" },
        { status: 401 }
      );
    }

    const { base64Image, mimeType } = await request.json();

    let result
    try {
      result = await main(base64Image, mimeType);
    } catch (aiErr) {
      // Log detailed OpenAI error info when available
      console.error('OpenAI error:', aiErr?.message || aiErr);
      if (aiErr.response) console.error('OpenAI response:', aiErr.response);
      // If the OpenAI SDK returned an HTTP error object, surface status and body if present
      if (aiErr?.cause?.status) {
        console.error('OpenAI HTTP status:', aiErr.cause.status);
      }
      return NextResponse.json({ error: 'AI service error. Check server logs.' }, { status: 502 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
