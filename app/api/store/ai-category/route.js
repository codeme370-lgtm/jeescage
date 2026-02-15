import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import authSeller from "@/middlewares/authSeller";
import { openai } from "@/configs/openai";

async function main({ name, description, base64Image, mimeType }) {
  const messages = [
    {
      role: "system",
      content: `You are an e-commerce assistant. Given a product name, description and/or image, suggest a single product category (short string) and two price suggestions (mrp, price). Respond ONLY with raw JSON like: { "category": string, "suggestedMrp": number, "suggestedPrice": number }`,
    },
    {
      role: "user",
      content: `Analyze this product and suggest category and prices. Name: ${name || ''} Description: ${description || ''}`,
    },
  ];

  // include image as context if provided
  if (base64Image && mimeType) {
    messages.push({
      role: 'user',
      content: `Image: data:${mimeType};base64,${base64Image}`
    })
  }

  const response = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    messages,
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, '').trim();
  try {
    const parsed = JSON.parse(cleaned);
    // normalize numbers
    return {
      category: parsed.category || parsed.cat || '',
      suggestedMrp: Number(parsed.suggestedMrp || parsed.mrp || parsed.suggested_price || parsed.suggestedPrice) || 0,
      suggestedPrice: Number(parsed.suggestedPrice || parsed.price || parsed.suggested_price) || 0,
    }
  } catch (e) {
    throw new Error('AI did not return valid JSON for category/price')
  }
}

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const isSeller = await authSeller(userId);
    if (!isSeller) return NextResponse.json({ error: 'Not authorized' }, { status: 403 });

    const body = await request.json();
    const { name, description, base64Image, mimeType } = body;
    const result = await main({ name, description, base64Image, mimeType });
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
