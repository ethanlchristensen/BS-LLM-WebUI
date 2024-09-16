import { useState } from "react";
import { Chat } from "@/features/chat/components/chat";
import { ChatHistory } from "@/features/chatHistory/components/chat-history";
import Cookies from "js-cookie";
import { useSearchParams } from 'react-router-dom';

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedChatId, setSelectedChatId] = useState(searchParams.get("c"));

    function handleSelectedChatId(id: any) {
        setSelectedChatId(id);
    }

    return (
        <div className="w-full h-full flex overflow-hidden">
            <ChatHistory onSelectedIdChange={handleSelectedChatId} />
            <div className="w-full">
                <Chat token={Cookies.get('token')} chatId={selectedChatId} />
            </div>
        </div>
    )
};