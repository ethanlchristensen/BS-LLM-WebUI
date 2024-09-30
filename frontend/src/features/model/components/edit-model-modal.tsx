import { useEffect, useState } from "react";
import { Dialog, Flex, Button, Card, Text, Badge } from "@radix-ui/themes";
import { Button as LocalButton } from '@/components/ui/button';
import { Pencil2Icon } from '@radix-ui/react-icons';
import { BarLoader } from "react-spinners";
import { Color } from "@/types/color";
import { useGetModelQuery } from "../api/get-model-info";
import { ColorPicker } from "@/features/radixColor/components/color-picker";
import { updateModelMutation } from "../api/update-model";

interface UpdateModelModalProps {
    modelId: number;
}

export function UpdateModelModal({ modelId }: UpdateModelModalProps) {
    const { data, isLoading, error } = useGetModelQuery({ modelId: modelId });
    const [color, setColor] = useState<Color>('gray');
    const updateMutation = updateModelMutation();

    useEffect(() => {
        if (data) {
            setColor(data?.color || 'gray');
        }
    }, [data]);

    async function handleUpdate() {
        await updateMutation.mutateAsync({ data: { modelId: modelId, updates: { color: color } } });
    }

    function handleSetColor(color: Color) {
        console.log("set color called: " + color);
        setColor(color);
    }

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <LocalButton variant='ghost' className="p-2 flex justify-start">
                    <Pencil2Icon className="mr-2" />
                </LocalButton>
            </Dialog.Trigger>
            <Dialog.Content size='1'>
                <Dialog.Title size='2'>Edit Model Color</Dialog.Title>
                <div className='w-full flex flex-col justify-between items-center'
                    style={{
                        '--base-card-padding-top': 'var(--space-1)',
                        '--base-card-padding-bottom': 'var(--space-1)',
                        '--base-card-padding-left': 'var(--space-2)',
                        '--base-card-padding-right': 'var(--space-2)',
                    } as any}>
                    <div className="w-full flex mb-2">
                        <Text weight='bold' className="mr-2">
                            Current Model Color:
                        </Text>
                        <Badge className='w-16 flex items-center justify-center' size='2' variant="surface" color={color}>{color}</Badge>
                    </div>
                    <ColorPicker color={color} setColor={handleSetColor} />
                </div>
                <Flex gap="3" mt="4" justify="between">
                    <Dialog.Close>
                        <Button variant="soft" color="gray" size='1'>
                            Close
                        </Button>
                    </Dialog.Close>
                    <Dialog.Close>
                        <Button variant="solid" color="green" onClick={() => handleUpdate()} size='1'>
                            Update Model
                        </Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}