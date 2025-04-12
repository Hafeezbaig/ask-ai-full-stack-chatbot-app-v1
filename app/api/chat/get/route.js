import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        // get the chat data from the database
        await connectDB();
        const chatData = await Chat.find({ userId });
        // return the chat data
        return NextResponse.json({ success: true, data: chatData });




    } catch (error) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}