import { NextResponse } from "next/server";

import handleError from "@/lib/error";
import { ValidationError } from "@/lib/http-errors";
import { AIAnswerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  const { question, content, userAnswer } = await req.json();

  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GROQ_API_KEY in server environment.");
    }

    const validatedData = AIAnswerSchema.safeParse({ question, content });

    if (!validatedData.success) {
      throw new ValidationError(validatedData.error.flatten().fieldErrors);
    }

    const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant";
    const system =
      "You are a helpful assistant that provides informative responses in markdown format. " +
      "Use appropriate markdown syntax for headings, lists, code blocks, and emphasis where necessary. " +
      "For code blocks, use short-form smaller case language identifiers (e.g., 'js', 'py', 'ts', 'html', 'css').";
    const userPrompt =
      `Generate a markdown-formatted response to the following question: ${question}. ` +
      `Base it on the provided content: ${content}` +
      `Also, prioritize and incorporate the user's answer when formulating your response:  
      **User's Answer:** ${userAnswer}  `;

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: userPrompt },
          ],
        }),
      },
    );

    if (!response.ok) {
      let message = `Groq error: ${response.status}`;
      try {
        const errorBody = await response.json();
        message = errorBody?.error?.message || message;
      } catch {
        // ignore parse errors
      }
      throw new Error(message);
    }

    const data = await response.json();
    const text =
      data?.choices?.[0]?.message?.content || "No response generated.";

    return NextResponse.json({ success: true, data: text }, { status: 200 });
  } catch (error) {
    return handleError(error, "api") as APIErrorResponse;
  }
}
