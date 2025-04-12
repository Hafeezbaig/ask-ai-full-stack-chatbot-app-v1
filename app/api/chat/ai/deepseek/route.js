export const maxDuration = 60;

import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {


  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "User not authenticated" }, { status: 401 });
    }

    // find the chat data from the database
    // connect to the database
    await connectDB();
    const data = await Chat.findOne({ _id: chatId, userId });

    // create a user message object
    const userPrompt = { role: "user", content: prompt, timestamp: Date.now() };

    data.messages.push(userPrompt);

    // call the deepseek api to get the response

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "deepseek-chat",
        storey: true,
      });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.messages.push(message);
    data.save();
    // return the chat data
    return NextResponse.json({ success: true, data: message }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

