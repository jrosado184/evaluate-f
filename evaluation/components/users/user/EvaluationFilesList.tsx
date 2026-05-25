// components/employee-files/lists/EvaluationFilesList.tsx
import React from "react";
import { View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";

type Props = {
  files: any[];
  onOpenEvaluation: (evaluationId: string) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
  onSwipeableWillOpen: (ref: Swipeable | null) => void;
};

const EvaluationFilesList = ({
  files,
  onOpenEvaluation,
  onDeleteEvaluation,
  onSwipeableWillOpen,
}: Props) => {
  return (
    <View className="gap-2">
      {files.map((file) => (
        <EvaluationRow
          key={file._id}
          file={file}
          onPress={() => onOpenEvaluation(file._id)}
          onDelete={onDeleteEvaluation}
          handleSwipeableWillOpen={onSwipeableWillOpen}
        />
      ))}
    </View>
  );
};

export default EvaluationFilesList;
