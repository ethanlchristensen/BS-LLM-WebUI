import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tooltip, Text } from "@radix-ui/themes";
import { createConversationMutation } from "@/features/conversation/api/create-conversation";
import { useGetConversationsQuery } from "@/features/conversation/api/get-conversations";
import { Conversation, GroupedConverations } from "@/types/api";
import { ConversationList } from "./conversation-list";
import { ConversationListLoading } from "./conversation-list-loading";
import { useGetUserSettingsQuery } from "@/components/userSettings/api/get-user-settings";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  MessageSquarePlus,
} from "lucide-react";

export function ConversationHistory({ onSelectedIdChange }: any) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expanded, setExpanded] = useState(true);
  const [animating, setAnimating] = useState(false);
  const currentConversationId = searchParams.get("c");
  const { data: chats, isLoading } = useGetConversationsQuery();
  const createMutation = createConversationMutation();
  const [bookmarkedChats, setBookmarkChats] = useState<Conversation[]>([]);
  const [nonBookmarkChats, setNonBookmarkChats] = useState<GroupedConverations>(
    {
      Today: [],
      "This Week": [],
      "This Month": [],
      Old: [],
    }
  );

  function handleSetExpanded(e: any) {
    setAnimating(true);
    setExpanded(e);
    setTimeout(() => setAnimating(false), 300); // Match transition duration
  }

  function handleSetSelected(conversationId: string) {
    if (chats !== null && chats !== undefined) {
      onSelectedIdChange(conversationId);
      setSearchParams({ c: conversationId });
    }
  }

  async function handleNewConversation() {
    try {
      var response = await createMutation.mutateAsync({
        data: {
          previousConversationId: currentConversationId || undefined,
          data: { title: "New Conversation" },
        },
      });
      setSearchParams({ c: response.id });
      handleSetSelected(response.id);
    } catch (e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if (chats) {
      // Sort chats by created_at in descending order (latest first)
      const sortedChats = [...chats].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      // Collect all bookmarked chats
      const likedChats = sortedChats.filter((chat) => chat.liked);
      setBookmarkChats(likedChats);

      // Reset non-bookmarked chats grouping
      const groupedNonBookmarkChats: GroupedConverations = {
        Today: [],
        "This Week": [],
        "This Month": [],
        Old: [],
      };

      // Group non-bookmarked chats based on existing grouping
      sortedChats.forEach((chat) => {
        if (!chat.liked && chat.grouping !== undefined) {
          groupedNonBookmarkChats[chat.grouping].push(chat);
        }
      });

      setNonBookmarkChats(groupedNonBookmarkChats);
    }
  }, [chats]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out h-full ${
        expanded ? "w-[250px] max-w-[250px]" : ""
      }`}
    >
      {!expanded && (
        <div className="overflow-y-scroll no-scrollbar h-full">
          <div className="mx-2 mt-2 flex flex-col items-center">
            <Button
              variant={"ghost"}
              className="p-2"
              onClick={() => handleSetExpanded(true)}
            >
              <ArrowRightToLine size={15} strokeWidth={1.5} />
            </Button>
            <Tooltip content="New Conversation" side="right">
              <Button
                variant="ghost"
                className="p-2"
                onClick={async () => handleNewConversation()}
              >
                <MessageSquarePlus size={15} strokeWidth={1.5} />
              </Button>
            </Tooltip>
          </div>
        </div>
      )}
      <div
        className={`${
          expanded ? "overflow-y-scroll no-scrollbar" : "hidden"
        } border-r border-[#7d7d7d68] w-full h-full`}
      >
        <div
          className="flex justify-between items-center m-2"
          // style={{
          //   backgroundImage: `url(${userSettings?.profile.image})`,
          //   backgroundSize: "cover",
          //   backgroundPosition: "center",
          //   borderRadius: "4px", // Adjust the value to your preference
          //   overflow: "hidden", // Ensures the background image is clipped by the border
          // }}
        >
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => handleSetExpanded(false)}
          >
            <ArrowLeftToLine size={15} strokeWidth={1.5} />
          </Button>
          <Tooltip content="New Conversation" side="right">
            <Button
              variant="ghost"
              className="ml-2 p-2"
              onClick={async () => handleNewConversation()}
            >
              <MessageSquarePlus size={15} strokeWidth={1.5} />
            </Button>
          </Tooltip>
        </div>
        <div className="mx-2">
          <div className="flex flex-col justify-center align-top">
            <div className="flex flex-col w-full">
              {bookmarkedChats.length > 0 && (
                <div>
                  <div className="flex items-center justify-start">
                    <Text weight="bold" size="1" className="mr-1">
                      Chats You Loved
                    </Text>
                    <Text
                      weight="light"
                      size="1"
                    >{`(${bookmarkedChats.length})`}</Text>
                  </div>
                  {isLoading ? (
                    <ConversationListLoading />
                  ) : (
                    <ConversationList
                      chats={bookmarkedChats}
                      currentConversationId={currentConversationId}
                      handleSetSelected={handleSetSelected}
                    />
                  )}
                </div>
              )}
              {nonBookmarkChats.Today.length > 0 && (
                <div>
                  <div className="flex items-center justify-start">
                    <Text weight="bold" size="1" className="mr-1">
                      Today
                    </Text>
                    <Text
                      weight="light"
                      size="1"
                    >{`(${nonBookmarkChats.Today.length})`}</Text>
                  </div>
                  {isLoading ? (
                    <ConversationListLoading />
                  ) : (
                    <ConversationList
                      chats={nonBookmarkChats.Today}
                      currentConversationId={currentConversationId}
                      handleSetSelected={handleSetSelected}
                    />
                  )}
                </div>
              )}
              {nonBookmarkChats["This Week"].length > 0 && (
                <div>
                  <div className="flex items-center justify-start">
                    <Text weight="bold" size="1" className="mr-1">
                      This Week
                    </Text>
                    <Text
                      weight="light"
                      size="1"
                    >{`(${nonBookmarkChats["This Week"].length})`}</Text>
                  </div>
                  {isLoading ? (
                    <ConversationListLoading />
                  ) : (
                    <ConversationList
                      chats={nonBookmarkChats["This Week"]}
                      currentConversationId={currentConversationId}
                      handleSetSelected={handleSetSelected}
                    />
                  )}
                </div>
              )}
              {nonBookmarkChats["This Month"].length > 0 && (
                <div>
                  <div className="flex items-center justify-start">
                    <Text weight="bold" size="1" className="mr-1">
                      This Month
                    </Text>
                    <Text
                      weight="light"
                      size="1"
                    >{`(${nonBookmarkChats["This Month"].length})`}</Text>
                  </div>
                  {isLoading ? (
                    <ConversationListLoading />
                  ) : (
                    <ConversationList
                      chats={nonBookmarkChats["This Month"]}
                      currentConversationId={currentConversationId}
                      handleSetSelected={handleSetSelected}
                    />
                  )}
                </div>
              )}
              {nonBookmarkChats.Old.length > 0 && (
                <div>
                  <div className="flex items-center justify-start">
                    <Text weight="bold" size="1" className="mr-1">
                      Older
                    </Text>
                    <Text
                      weight="light"
                      size="1"
                    >{`(${nonBookmarkChats.Old.length})`}</Text>
                  </div>
                  {isLoading ? (
                    <ConversationListLoading />
                  ) : (
                    <ConversationList
                      chats={nonBookmarkChats.Old}
                      currentConversationId={currentConversationId}
                      handleSetSelected={handleSetSelected}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
