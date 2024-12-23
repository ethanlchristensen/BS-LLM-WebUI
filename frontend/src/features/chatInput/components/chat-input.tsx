import {
  Text,
  Button,
  Card,
  DropdownMenu,
  Skeleton,
  Badge,
  Switch,
} from "@radix-ui/themes";
import { Textarea } from "@/components/ui/textarea";
import { useState, useCallback } from "react";
import { BaseModelEntity } from "@/types/api";
import { Button as LocalButton } from "@/components/ui/button";
import { ImageUploadButton } from "@/features/imageUpload/components/image-upload-button";
import { Rocket, Folder, X } from "lucide-react";
import { useUserSettings } from "@/components/userSettings/user-settings-provider";

interface Props {
  onSendMessage: (message: string) => void;
  onModelChange: (model: BaseModelEntity) => void;
  onImageDataChange: (model: File | null) => void;
  selectedModel: BaseModelEntity | null;
  models: BaseModelEntity[] | undefined;
  modelsLoading: boolean;
  isLoading: boolean;
}

export function ChatInput({
  onSendMessage,
  onModelChange,
  onImageDataChange,
  selectedModel,
  models,
  modelsLoading,
  isLoading,
}: Props) {
  const [newMessage, setNewMessage] = useState("");
  const [textAreaHeight, setTextAreaHeight] = useState(48);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imageData, setImageData] = useState<File | null>(null);


  const handleSendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSendMessage(newMessage);
    setNewMessage("");
    setTextAreaHeight(48);
    handleClear();
  };

  const handleKeyDown = (event: any) => {
    if (event.shiftKey && event.key === "Enter") {
      setTextAreaHeight(Math.min(textAreaHeight + 24, 240)); // Limit expansion to 240px
    } else if (event.key === "Enter") {
      event.preventDefault();
      onSendMessage(newMessage);
      setNewMessage("");
      setTextAreaHeight(48);
      handleClear();
    } else if (event.key === "Backspace" && textAreaHeight > 48) {
      if (newMessage.endsWith("\n")) {
        setTextAreaHeight(Math.max(textAreaHeight - 24, 48));
      }
    }
  };

  function handleModelChange(model: BaseModelEntity) {
    onModelChange(model);
  }

  const handleFileChange = useCallback((newFile: File | null) => {
    onImageDataChange(newFile);
    setImageData(newFile);
    setImageName(newFile ? newFile.name : null);
  }, []);

  const handleClear = useCallback(() => {
    onImageDataChange(null);
    setImageData(null);
    setImageName(null);
  }, []);

  const handleOuterClear = () => {
    handleClear();
    console.log("File cleared from parent component");
  };

  const groupedModels = models?.reduce((acc, model) => {
    const { provider } = model; // Ensure your model has a provider field
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, BaseModelEntity[]>);

  return (
    <div
      className={`chat-input mb-4 flex flex-col w-full ${
        isLoading ? "chat-input-border" : ""
      }`}
    >
      <form onSubmit={handleSendMessage} className="flex justify-between">
        <Card
          className={`w-full`}
          style={
            {
              "--base-card-padding-top": "var(--space-1)",
              "--base-card-padding-bottom": "var(--space-1)",
              "--base-card-padding-left": "var(--space-2)",
              "--base-card-padding-right": "var(--space-2)",
            } as any
          }
          size="1"
          variant="classic"
        >
          <div className={`flex justify-between items-center h-full`}>
            <div className="flex flex-col w-full">
              <Textarea
                className="outline-none border-none w-full py-3 px-1 rounded-l resize-none h-[48px] no-scrollbar"
                onChange={(event) => setNewMessage(event.target.value)}
                value={newMessage}
                placeholder="Type your message here"
                onKeyDown={handleKeyDown}
                style={{ height: `${textAreaHeight}px` }}
              />
              <div className="flex justify-between items-center">
                <div className="mr-2">
                  <div className="flex items-center">
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger>
                        <Button
                          variant="surface"
                          color={selectedModel?.color || "gray"}
                          size="1"
                        >
                          {modelsLoading ? (
                            <Skeleton width="60px" />
                          ) : (
                            selectedModel?.name || "Select a model"
                          )}

                          <DropdownMenu.TriggerIcon />
                        </Button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Content>
                        {groupedModels &&
                          Object.keys(groupedModels).map((provider) => (
                            <DropdownMenu.Group key={provider}>
                              <Badge
                                variant="soft"
                                className="w-full"
                                color="gray"
                              >
                                <Text size="2" weight="bold">
                                  {provider}
                                </Text>
                              </Badge>
                              {groupedModels[provider].map((model) => (
                                <DropdownMenu.Item
                                  onClick={() => handleModelChange(model)}
                                  key={model.id}
                                  color={model.color}
                                >
                                  <Text size="1" weight="regular">
                                    {model.model}
                                  </Text>
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.Group>
                          ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Root>
                    <div className="ml-2">
                      <LocalButton variant="ghost-no-hover" className="m-1 p-0">
                        <Folder size={15} strokeWidth={1.5} />
                      </LocalButton>
                    </div>
                    {imageName ? null : (
                      <div>
                        <ImageUploadButton
                          fileName={imageName}
                          onFileChange={handleFileChange}
                          onClear={handleClear}
                        />
                      </div>
                    )}
                    {imageName ? (
                      <div>
                        <Badge
                          radius="full"
                          variant="surface"
                          color="gray"
                          className="ml-2"
                        >
                          <div className="w-full flex justify-between items-center px-2">
                            <Text weight="light" size="1">
                              {imageName}
                            </Text>
                            <LocalButton
                              size="tiny"
                              variant="ghost-no-hover"
                              className="h-6"
                              onClick={handleOuterClear}
                            >
                              <X size={10} />
                            </LocalButton>
                          </div>
                        </Badge>
                      </div>
                    ) : null}
                  </div>
                </div>
                <Button type="submit" size="1" variant="surface" color="green">
                  <Text size="1">Submit</Text>
                  <Rocket size={15} />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
