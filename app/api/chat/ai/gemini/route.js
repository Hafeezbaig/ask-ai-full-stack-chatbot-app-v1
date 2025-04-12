export const maxDuration = 60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, message: "Prompt is required" }, { status: 400 });
    }

    // Create Gemini model instance
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generate response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const assistantMessage = {
      role: "assistant",
      content: text,
      timestamp: Date.now(),
    };

    // 🔐 Logged-in user logic
    if (userId && chatId) {
      await connectDB();
      const chat = await Chat.findOne({ _id: chatId, userId });

      if (!chat) {
        return NextResponse.json({ success: false, message: "Chat not found" }, { status: 404 });
      }

      const userMessage = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      chat.messages.push(userMessage);
      chat.messages.push(assistantMessage);
      await chat.save();
    }

    // ✅ Return assistant message in both cases (guest or logged-in)
    return NextResponse.json({ success: true, data: assistantMessage }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
