import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        // prepare the chat data to be saved in the database
        const chatData = {
            userId,
            name: "New Chat",
            messages: [],
        };
        // connect to the database
        await connectDB();
        await Chat.create(chatData);
        // return a success response
        return NextResponse.json({success: true, message: "Chat created"}, {status: 200});
    } catch (error) {
        return NextResponse.json({success: false, message: "Error creating chat"}, {status: 500});
    }
}