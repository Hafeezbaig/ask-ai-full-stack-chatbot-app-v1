import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        const { chatId } = await req.json();


        if (!userId) {
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        // connect to the database
        await Chat.deleteOne({_id: chatId, userId});
        // return a success response
        return NextResponse.json({success: true, message: "Chat deleted"}, {status: 200});

    } catch (error) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}
