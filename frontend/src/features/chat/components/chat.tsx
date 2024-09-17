import { useState, useEffect } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { ChatMessage } from '@/features/chatMessage/components/chat-message';
import { createUserMessage } from '@/features/chatMessage/api/create-user-message';
import { createAssistantMessage } from '@/features/chatMessage/api/create-assistant-message';
import { ConversationDetailMessage } from '@/types/api';
import { updateConversationMutation } from '@/features/conversation/api/update-conversation';
import { useGetConversationQuery } from '@/features/conversation/api/get-conversation';
import { Callout } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { HashLoader } from 'react-spinners';


export function Chat({ chatId }: any) {
    const [messages, setMessages] = useState<ConversationDetailMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ref = useScrollToEnd(messages);
    const updateMutation = updateConversationMutation();
    const { data, error, isLoading: conversationLoading } = useGetConversationQuery({ conversationId: chatId });

    useEffect(() => {
        if (data) {
            const newMessages = data.messages.map((message: any) => ({
                type: message.type,
                content: message.content,
                id: message.id,
                createdAt: message.createdAt,
            }));
            setMessages(newMessages);
        }
    }, [data]);

    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {
            const userPostData = await createUserMessage({ data: { conversation: chatId, content: message } });
            if (messages.length == 0) {
                await updateMutation.mutateAsync({ conversationId: chatId, data: { title: message } });
            }
            setMessages(erm => [...erm, { content: userPostData.content, type: 'user', id: userPostData.id, createdAt: userPostData.createdAt }]);
            setIsLoading(true);
            var payload = {
                model: "llama3.1",
                messages: [{ role: "user", content: message }],
                stream: false,
            }
            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            setIsLoading(false);
            const assistantPostData = await createAssistantMessage({ data: { conversation: chatId, content: response.data.message.content, model: "llama3.1", provider: "ollama" } });
            setMessages(erm => [...erm, { content: assistantPostData.content, type: 'assistant', id: assistantPostData.id, createdAt: assistantPostData.createdAt }]);
        }
    }

    return (
        <div className='flex flex-col items-center'>
            <div className='flex flex-col justify-between align-middle h-screen w-[60%]'>
                {
                    conversationLoading && (
                        <div className='w-full h-full flex flex-col items-center justify-center'>
                            <HashLoader color='#484848' size={100}/>
                        </div>
                    )
                }
                <div className='pt-4 overflow-x-hidden overflow-y-scroll no-scrollbar'>
                    {
                        error && (<Callout.Root color='red' variant='surface'>
                            <Callout.Icon>
                                <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                                Failed to get conversation {chatId}: {error.message}
                            </Callout.Text>
                        </Callout.Root>)
                    }
                    {messages.map((message, index) => (
                        <ChatMessage messageText={message.content} messageType={message.type} messageId={message.id} conversationId={chatId} />
                    ))}
                    {
                        (isLoading) && (
                            <div className='flex justify-start'>
                                <Panel title='LLM' justify='justify-start'>
                                    <ChatLoader />
                                </Panel>
                            </div>
                        )
                    }
                    <div ref={ref} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} />
            </div>
        </div>
    );
}
