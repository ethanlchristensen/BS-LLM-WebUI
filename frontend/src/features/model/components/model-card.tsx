import { Badge, Card, Text, ScrollArea, Box } from "@radix-ui/themes";
import { ModelDetail } from "@/types/api";
import MarkdownRenderer from "@/features/markdown/components/markdown";

interface ModelCardProps {
  data: ModelDetail | undefined;
}

export function ModelCard({ data }: ModelCardProps) {
  return data?.provider === "ollama" ? (
    <div className="p-1 w-full overflow-y-scroll no-scrollbar">
      <Card>
        <div className="mb-2">
          <Badge
            color={data?.color}
            variant="surface"
            className="w-full flex  justify-center items-center"
          >
            <Text size="4" weight="bold">
              {data?.model}
            </Text>
          </Badge>
        </div>
        <div className="mt-2">
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                License
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <MarkdownRenderer markdown={data?.details?.license || ""} />
                </Text>
              </Box>
            </ScrollArea>
          </div>
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                Template
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <MarkdownRenderer markdown={data?.details?.template || ""} />
                </Text>
              </Box>
            </ScrollArea>
          </div>
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                Parameters
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <MarkdownRenderer markdown={data?.details?.parameters || ""} />
                </Text>
              </Box>
            </ScrollArea>
          </div>
          <div className="mb-2">
            <div className="mb-1">
              <Text as="p" size="3" weight="bold">
                Model File
              </Text>
            </div>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 120 }}
            >
              <Box p="2" pr="8">
                <Text as="p">
                  <MarkdownRenderer markdown={data?.details?.modelfile || ""} />
                </Text>
              </Box>
            </ScrollArea>
          </div>
        </div>
      </Card>
    </div>
  ) : (
    <div className="p-1 w-full overflow-y-scroll no-scrollbar">
      <Card>
        <div className="mb-2">
          <Badge
            color={data?.color}
            variant="surface"
            className="w-full flex  justify-center items-center"
          >
            <Text size="4" weight="bold">
              {data?.model}
            </Text>
          </Badge>
        </div>
        <img
              src="construct.png"
              alt=""
              style={{
                display: "block",
                objectFit: "cover",
                width: "100%",
                height: 500,
              }}
            />
      </Card>
    </div>
  );
}
