import { useState, useEffect } from 'react';
import axios from 'axios';
import useScrollToEnd from '@/features/chat/hooks/use-scroll-to-end';
import { ChatLoader } from '@/features/chatLoader/components/chat-loader';
import Panel from '@/components/ui/panel';
import { ChatInput } from '@/features/chatInput/components/chat-input';
import { createUserMessage } from '@/features/chatMessage/api/create-user-message';
import { createAssistantMessage } from '@/features/chatMessage/api/create-assistant-message';
import { updateConversationMutation } from '@/features/conversation/api/update-conversation';
import { useGetConversationQuery } from '@/features/conversation/api/get-conversation';
import { Callout } from '@radix-ui/themes';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import { HashLoader } from 'react-spinners';
import { createConversationMutation } from '@/features/conversation/api/create-conversation';
import { useGetModelsQuery } from '@/features/model/api/get-models';
import { useQueryClient } from '@tanstack/react-query';
import { UserChatMessage } from '@/features/chatMessage/components/user-chat-message';
import { AssistantChatMessage } from '@/features/chatMessage/components/assistant-chat-message';
import { UserMessage, AssistantMessage, BaseModelEntity } from '@/types/api';

interface ChatProps {
    chatId: string;
    onCreateNewChat: (newChatId: string) => void;
}

type Message = UserMessage | AssistantMessage;

export function Chat({ chatId, onCreateNewChat }: ChatProps) {
    const [messages, setMessages] = useState<(UserMessage | AssistantMessage)[]>([]);
    const [model, setModel] = useState<BaseModelEntity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [imageData, setImageData] = useState<File | null>(null);

    const updateMutation = updateConversationMutation();
    const createMutation = createConversationMutation();

    const { data: models, isLoading: modelsLoading } = useGetModelsQuery();
    const { data, error, isLoading: conversationLoading } = useGetConversationQuery({ conversationId: chatId });

    const ref = useScrollToEnd(messages);

    const queryClient = useQueryClient();

    useEffect(() => {
        if (data) {
            const newMessages = data.messages.map((message: any) => {
                if (message.type === 'user') {
                    return {
                        type: message.type,
                        content: message.content,
                        id: message.id,
                        createdAt: message.created_at,
                        liked: message.liked,
                        conversation: message.conversation,
                        image: message.image
                    } as UserMessage;
                } else {
                    return {
                        type: message.type,
                        content: message.content,
                        id: message.id,
                        createdAt: message.created_at,
                        model: message.model,
                        provider: message.provider,
                        liked: message.liked,
                        conversation: message.conversation
                    } as AssistantMessage;
                }
            });
            setMessages(newMessages);
        } else {
            setMessages([]);
        }

        if (!chatId) {
            setMessages([]);
        }
    }, [data]);

    useEffect(() => {
        if (models && models?.length > 0 && !model) {
            setModel(models[0]);
        }
    }, [models]);

    useEffect(() => {
        if (chatId) {
            queryClient.invalidateQueries({ queryKey: ["conversation", chatId] });
        }
    }, [chatId]);

    function isUserMessage(message: Message): message is UserMessage {
        return message.type === 'user';
    }

    function isAssistantMessage(message: Message): message is AssistantMessage {
        return message.type === 'assistant';
    }

    async function handleCreateNewConversation(firstMessage: string) {
        var response = await createMutation.mutateAsync({ data: { previousConversationId: chatId || undefined, data: { title: firstMessage } } });
        onCreateNewChat(response.id);
        return response.id;
    }

    const toDataURL = async (url: string | null): Promise<string | null> => {
        if (!url) return null;
        const response = await fetch(url);
        const blob = await response.blob();

        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64Data = reader.result as string;
                const base64String = base64Data.split(',')[1];
                resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };


    async function handleSendMessage(message: string) {
        if (message.trim().length > 0) {

            var currentChatId = chatId;

            if (!chatId) {
                currentChatId = await handleCreateNewConversation(message);
            }

            const userPostData = await createUserMessage({ data: { conversation: currentChatId, content: message, image: imageData } });
            if (messages.length == 0) {
                await updateMutation.mutateAsync({ data: { conversationId: currentChatId, updates: { title: message } } });
            }
            const newUserMessage: UserMessage = {
                id: userPostData.id,
                createdAt: userPostData.createdAt,
                content: userPostData.content,
                conversation: userPostData.conversation,
                image: userPostData.image,
                type: 'user'
            };

            setMessages(messages => [...messages, newUserMessage]);
            setIsLoading(true);
            var image_data = await toDataURL(userPostData.image);
            var payload = {
                model: model?.name,
                messages: [{ role: "user", content: message, images: image_data ? [image_data] : [] }],
                stream: false
            }
            const response = await axios.post('http://192.168.1.11:11434/api/chat', payload);
            setIsLoading(false);
            const assistantPostData = await createAssistantMessage({ data: { conversation: currentChatId, content: response.data.message.content, model: model?.id || -1, provider: "ollama" } });

            const newAssistantMessage: AssistantMessage = {
                id: assistantPostData.id,
                createdAt: assistantPostData.createdAt,
                content: assistantPostData.content,
                conversation: assistantPostData.conversation,
                model: assistantPostData.model,
                provider: assistantPostData.provider,
                liked: assistantPostData.liked,
                type: 'assistant'
            }

            setMessages(messages => [...messages, newAssistantMessage]);
        }
    }

    return (
        <div className='flex flex-col items-center relative'>
            <div className='flex flex-col justify-between align-middle h-screen w-[60%] z-10 relative'>
                {
                    conversationLoading && (
                        <div className='w-full h-full flex flex-col items-center justify-center'>
                            <HashLoader color='#484848' size={200} />
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
                    {messages.map((message) => {
                        if (isUserMessage(message)) {
                            return <UserChatMessage key={message.id} userMessageData={message} />;
                        } else if (isAssistantMessage(message)) {
                            return <AssistantChatMessage key={message.id} assistantMessageData={message} />;
                        } else {
                            return null;
                        }
                    })}
                    {
                        (isLoading) && (
                            <div className='flex justify-start mb-4'>
                                <Panel title='LLM' justify='justify-start'>
                                    <ChatLoader />
                                </Panel>
                            </div>
                        )
                    }
                    <div ref={ref} />
                </div>
                <ChatInput onSendMessage={handleSendMessage} onModelChange={setModel} onImageDataChange={setImageData} selectedModel={model} models={models} modelsLoading={modelsLoading} />
            </div>
        </div>
    );
}
