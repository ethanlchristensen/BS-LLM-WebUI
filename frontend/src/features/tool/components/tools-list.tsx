import { Button } from "@/components/ui/button";
import { Popover } from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Tool } from "@/types/api";
import { Trash2 } from "lucide-react";

export function ToolList({
  tools,
  selectedToolId,
  handleSetSelected,
}: {
  tools: Tool[] | undefined;
  selectedToolId: string | null;
  handleSetSelected: any;
}) {
  return (
    <div className="w-full">
      {tools?.map((tool) => (
        <div className="w-full flex justify-between items-center group" key={`tool-${tool.id}`}>
          <div className="w-full overflow-hidden">
              {tool.id === selectedToolId ? (
                <Button
                  size="sm"
                  variant={"ghost"}
                  className="w-full justify-between bg-accent text-accent-foreground"
                  onClick={() => handleSetSelected(tool.id)}
                >
                  {tool.name}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant={"ghost"}
                  className="w-full justify-between overflow-hidden"
                  onClick={() => handleSetSelected(tool.id)}
                >
                  {tool.name}
                </Button>
              )}
            {/* </Tooltip> */}
          </div>
          <div className="flex justify-center">
            <Popover.Root>
              <Popover.Trigger>
                <Button variant="ghost" size="icon">
                  <DotsHorizontalIcon />
                </Button>
              </Popover.Trigger>
              <Popover.Content side="bottom">
                <div className="flex flex-col items-start">
                  {/* <PinConversationButton
                    conversationId={chat.id}
                    isLiked={chat.liked}
                  />
                  <UpdateConversationModal
                    conversationId={chat.id}
                    currentTitle={chat.title}
                  />
                  <MagicTitleButton conversationId={chat.id} />
                  <Separator size="4" /> */}
                  {/* <DeleteConversationModal conversationId={chat.id} /> */}
                  <Trash2 size={15} />
                </div>
              </Popover.Content>
            </Popover.Root>
          </div>
        </div>
      ))}
    </div>
  );
}
