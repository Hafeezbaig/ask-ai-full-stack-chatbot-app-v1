import Chat from "@/models/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";


export async function POST(req) {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return NextResponse.json({success: false, message: "User not authenticated"}, {status: 401});
        }

        const { chatId, name } = await req.json();
        // if (!chatId || !name) {
        //     return NextResponse.json({success: false, message: "Chat ID and name are required"}, {status: 400});
        // }

        // connect to the database
        await connectDB();
        await Chat.findOneAndUpdate({_id: chatId, userId}, {name});
        // return a success response
        return NextResponse.json({success: true, message: "Chat renamed"}, {status: 200});
    

    } catch (error) {
        return NextResponse.json({success: false, error: error.message}, {status: 500});
    }
}