export const maxDuration = 60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Load Gemini via Google Generative AI SDK
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    // Connect DB and find chat
    await connectDB();
    const data = await Chat.findOne({ _id: chatId, userId });

    // Add user prompt to chat history
    const userPrompt = { role: "user", content: prompt, timestamp: Date.now() };
    data.messages.push(userPrompt);

    // Create Gemini model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const message = {
      role: "assistant",
      content: text,
      timestamp: Date.now(),
    };

    // Save message
    data.messages.push(message);
    await data.save();

    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
