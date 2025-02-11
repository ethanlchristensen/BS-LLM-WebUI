import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, Text } from "@radix-ui/themes";
import { PlusIcon, PinLeftIcon, PinRightIcon } from "@radix-ui/react-icons";
import { useGetModelsQuery } from "@/features/model/api/get-models";
import { ModelList } from "@/features/model/components/model-list";
import { ModelListLoading } from "@/features/model/components/model-list-loading";

export function Models({ selectedModelId, onSelectedModelIdChange }: any) {
  const { data: models, isLoading } = useGetModelsQuery();

  function handleSetSelected(modelId: number) {
    if (models !== null && models !== undefined) {
      onSelectedModelIdChange(modelId);
    }
  }

  function handleNewModel() {
    console.log("New Model");
  }

  useEffect(() => {
    if (models && models.length > 0) {
      onSelectedModelIdChange(models[0].id);
    }
  }, [models]);

  return (
    <div className="w-[250px] max-w-[250px] h-full">
      <div className="overflow-y-scroll no-scrollbar border-r border-[#7d7d7d68] w-full h-full">
        <div className="flex justify-end items-center mx-2 mt-2">
          <Tooltip content="New Model" side="right">
            <Button
              variant="ghost"
              className="ml-2 p-2"
              onClick={async () => handleNewModel()}
            >
              <PlusIcon />
            </Button>
          </Tooltip>
        </div>
        <div className="mx-2">
          <div className="flex flex-col justify-center align-top">
            <div className="flex flex-col w-full">
              <div>
                <Text weight="bold">Models</Text>
                {isLoading ? (
                  <ModelListLoading />
                ) : (
                  <ModelList
                    models={models}
                    selectedModelId={selectedModelId}
                    handleSetSelected={handleSetSelected}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
