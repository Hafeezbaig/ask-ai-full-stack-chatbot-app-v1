'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { assets } from '@/assets/assets';
import { useAppContext } from '@/context/AppContext';
import toast from 'react-hot-toast';
import axios from 'axios';

const PromptBox = ({ setIsLoading, isLoading }) => {
    const [prompt, setPrompt] = useState('');
    const [guestMessageCount, setGuestMessageCount] = useState(0); // ✅ new
    const timestampRef = useRef(Date.now());
    const { user, chats, setChats, selectedChat, setSelectedChat } = useAppContext();

    useEffect(() => {
        // ✅ reset message count on login
        if (user) {
            setGuestMessageCount(0);
        }
    }, [user]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt(e);
        }
    };

    const sendPrompt = async (e) => {
        const promptCopy = prompt;

        try {
            e.preventDefault();
            if (isLoading) return toast.error('Please wait for the previous message to load');

            const isGuest = !user || selectedChat?._id === 'guest-chat';

            if (isGuest && guestMessageCount >= 2) {
                toast.error('Login to continue chatting');
                return;
            }

            setIsLoading(true);
            setPrompt('');

            let chat = selectedChat;

            // Create a guest chat if none is selected
            if (!chat) {
                chat = {
                    _id: 'guest-chat',
                    messages: []
                };
                setSelectedChat(chat);
            }

            const userPrompt = {
                role: 'user',
                content: prompt,
                timestamp: timestampRef.current
            };

            setSelectedChat((prev) => ({
                ...prev,
                messages: [...(prev?.messages || []), userPrompt]
            }));

            setChats((prev) => {
                const existing = prev.find(c => c._id === chat._id);
                if (existing) {
                    return prev.map(c =>
                        c._id === chat._id
                            ? { ...c, messages: [...c.messages, userPrompt] }
                            : c
                    );
                } else {
                    return [...prev, { ...chat, messages: [userPrompt] }];
                }
            });

            if (isGuest) {
                setGuestMessageCount(prev => prev + 1); // ✅ track guest usage
            }

            // API call (omit chatId if guest)
            const { data } = await axios.post('/api/chat/ai/gemini', {
                ...(isGuest ? { prompt } : { chatId: chat._id, prompt }),
            });

            if (data.success) {
                const fullMessage = data.data.content;
                const messageTokens = fullMessage.split(' ');
                const assistantTimestamp = timestampRef.current;

                const assistantMessage = {
                    role: 'assistant',
                    content: '',
                    timestamp: assistantTimestamp
                };

                setSelectedChat((prev) => ({
                    ...prev,
                    messages: [...prev.messages, assistantMessage]
                }));

                for (let i = 0; i < messageTokens.length; i++) {
                    setTimeout(() => {
                        const updatedMessage = {
                            ...assistantMessage,
                            content: messageTokens.slice(0, i + 1).join(' '),
                            timestamp: assistantTimestamp
                        };

                        setSelectedChat((prev) => {
                            const updatedMessages = [...prev.messages];
                            updatedMessages[updatedMessages.length - 1] = updatedMessage;
                            return {
                                ...prev,
                                messages: updatedMessages
                            };
                        });
                    }, i * 50);
                }

                // Final sync to global chats
                setTimeout(() => {
                    setChats((prevChats) =>
                        prevChats.map(chat =>
                            chat._id === selectedChat._id
                                ? {
                                    ...chat,
                                    messages: [
                                        ...chat.messages.slice(0, -1),
                                        { ...assistantMessage, content: fullMessage }
                                    ]
                                }
                                : chat
                        )
                    );
                }, messageTokens.length * 50 + 100);

            } else {
                toast.error(data.message);
                setPrompt(promptCopy);
            }

        } catch (error) {
            console.error(error);
            toast.error('Something went wrong.');
            setPrompt(promptCopy);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form
            onSubmit={sendPrompt}
            className={`w-full ${selectedChat?.messages?.length > 0 ? 'max-w-3xl' : 'max-w-2xl'} bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
        >
            <textarea
                onKeyDown={handleKeyDown}
                className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
                rows={2}
                placeholder="Message AskAI"
                required
                onChange={(e) => setPrompt(e.target.value)}
                value={prompt}
            />

            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image className="h-5" src={assets.deepthink_icon} alt="image" />
                        DeepThink
                    </p>
                    <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
                        <Image className="h-5" src={assets.search_icon} alt="image" />
                        Search
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="image" />
                    <button className={`${prompt ? 'bg-primary' : 'bg-[#71717a'} rounded-full p-2 cursor-pointer`}>
                        <Image
                            className="w-3.5 aspect-square"
                            src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
                            alt="send"
                        />
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PromptBox;
