import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { FileCategory, FileCategoryKey } from "./EmployeeFilesHub";
import EmployeeFilesEmptyState from "./EmployeeFilesEmptyState";
import JsaFilesList from "./jsa/JsaFilesList";
import EvaluationFilesList from "./EvaluationFilesList";

type Props = {
  activeCategory: FileCategoryKey;
  categories: FileCategory[];
  evaluationFiles: any[];
  onOpenEvaluation: (evaluationId: string) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
  onSwipeableWillOpen: (ref: Swipeable | null) => void;
  onOpenJsa?: (jsaId: string) => void;
};

const EmployeeFilesPanel = ({
  activeCategory,
  categories,
  evaluationFiles,
  onOpenEvaluation,
  onDeleteEvaluation,
  onSwipeableWillOpen,
  onOpenJsa,
}: Props) => {
  const [jsaCount, setJsaCount] = useState(0);
  const [jsaLoading, setJsaLoading] = useState(false);

  const activeCategoryLabel =
    categories.find((category) => category.key === activeCategory)?.title ||
    "Files";

  const showEvaluations =
    activeCategory === "all" || activeCategory === "evaluations";

  const showJsas = activeCategory === "all" || activeCategory === "jsas";

  const hasEvaluationFiles = evaluationFiles.length > 0;
  const hasJsaFiles = jsaCount > 0;

  const shouldShowEmpty = useMemo(() => {
    if (jsaLoading) return false;

    if (activeCategory === "evaluations") {
      return !hasEvaluationFiles;
    }

    if (activeCategory === "jsas") {
      return !hasJsaFiles;
    }

    if (activeCategory === "all") {
      return !hasEvaluationFiles && !hasJsaFiles;
    }

    return true;
  }, [activeCategory, hasEvaluationFiles, hasJsaFiles, jsaLoading]);

  return (
    <View className="bg-white">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-lg font-semibold text-neutral-950">
            {activeCategoryLabel}
          </Text>

          <Text className="mt-1 text-xs text-neutral-500">
            Recently created or updated files
          </Text>
        </View>
      </View>

      <View className="gap-3">
        {showEvaluations && hasEvaluationFiles && (
          <EvaluationFilesList
            files={evaluationFiles}
            onOpenEvaluation={onOpenEvaluation}
            onDeleteEvaluation={onDeleteEvaluation}
            onSwipeableWillOpen={onSwipeableWillOpen}
          />
        )}

        {showJsas && (
          <JsaFilesList
            onOpenJsa={onOpenJsa}
            onCountChange={setJsaCount}
            onLoadingChange={setJsaLoading}
            showEmptyState={activeCategory === "jsas"}
          />
        )}

        {shouldShowEmpty && <EmployeeFilesEmptyState />}
      </View>
    </View>
  );
};

export default EmployeeFilesPanel;
