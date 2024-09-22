import { TextField, TextArea, IconButton, Text, Button, Card, Popover, Box, Flex, Checkbox, Avatar, DropdownMenu } from '@radix-ui/themes';
import { RocketIcon, ChatBubbleIcon, FileIcon, ImageIcon, FileTextIcon } from '@radix-ui/react-icons';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { useGetModelsQuery } from '@/features/model/api/get-models';

interface Props {
    onSendMessage: (message: string) => void;
    onModelChange: (message: string) => void;
}

export function ChatInput({ onSendMessage, onModelChange }: Props) {
    const [newMessage, setNewMessage] = useState('');
    const [newContext, setNewContext] = useState('');
    const [textAreaHeight, setTextAreaHeight] = useState(48);
    const [lastMessage, setLastMessage] = useState('');
    const { data } = useGetModelsQuery();
    const [model, setModel] = useState(data ? data[0].name : "llama3.1:latest");

    const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSendMessage(newMessage + '\n\n' + newContext);
        setLastMessage(newMessage);
        setNewMessage('');
        setNewContext('');
        setTextAreaHeight(48);
    };

    const handleKeyDown = (event: any) => {
        if (event.shiftKey && event.key === 'Enter') {
            setTextAreaHeight(Math.min(textAreaHeight + 24, 240)); // Limit expansion to 240px
        }
        else if (event.key === 'Enter') {
            event.preventDefault();
            onSendMessage(newMessage);
            setLastMessage(newMessage);
            setNewMessage('');
            setNewContext('');
            setTextAreaHeight(48);
        } else if (event.key === 'Backspace' && textAreaHeight > 48) {
            if (newMessage.endsWith('\n')) {
                setTextAreaHeight(Math.max(textAreaHeight - 24, 48));
            }
        }
    };

    function handleModelChange(model: string) {
        setModel(model);
        onModelChange(model);
    }

    return (
        <div className='chat-input mb-4 flex flex-col w-full'>
            <form onSubmit={handleSendMessage} className='flex justify-between'>
                <Card
                    className='w-full'
                    style={{
                        '--base-card-padding-top': 'var(--space-1)',
                        '--base-card-padding-bottom': 'var(--space-1)',
                        '--base-card-padding-left': 'var(--space-2)',
                        '--base-card-padding-right': 'var(--space-2)',
                    } as any} size="1" variant='surface'>
                    <div className='flex justify-between items-center h-full'>
                        <div className='flex flex-col w-full'>
                            <Textarea
                                className='mr-2 outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar'
                                onChange={(event) => setNewMessage(event.target.value)}
                                value={newMessage}
                                placeholder='Type your message here'
                                onKeyDown={handleKeyDown}
                                style={{ height: `${textAreaHeight}px` }}
                            />
                            <div className='flex justify-between'>
                                <div className='mr-2'>
                                    <DropdownMenu.Root>
                                        <DropdownMenu.Trigger>
                                            <Button variant="surface" size='1'>
                                                {model}
                                                <DropdownMenu.TriggerIcon />
                                            </Button>
                                        </DropdownMenu.Trigger>
                                        <DropdownMenu.Content>
                                            {data?.map((model) => (
                                                <DropdownMenu.Item onClick={() => handleModelChange(model.name)}>{model.name}</DropdownMenu.Item>
                                            ))}
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Root>
                                </div>
                                <Button type='submit' size='1' variant='surface' color='green'>
                                    <Text size='1'>
                                        Submit
                                    </Text>
                                    <RocketIcon />
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </form>
        </div>
    );
};

