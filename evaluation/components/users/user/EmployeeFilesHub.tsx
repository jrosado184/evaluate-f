import React, { Dispatch, SetStateAction, useMemo } from "react";

import { ScrollView, Text, View } from "react-native";

import Icon from "react-native-vector-icons/Feather";

import { Swipeable } from "react-native-gesture-handler";

import SinglePressTouchable from "@/app/utils/SinglePress";

import FileCategoryCard from "./FileCategoryCard";

import EmployeeFilesPanel from "./EmployeeFilesPanel";

export type FileCategoryKey =
  | "all"
  | "evaluations"
  | "workHardening"
  | "newHire"
  | "jsas";

export type FileCategory = {
  key: FileCategoryKey;
  title: string;
  icon: string;
  count: number;
};

type Props = {
  isTablet: boolean;
  activeCategory: FileCategoryKey;
  setActiveCategory: Dispatch<SetStateAction<FileCategoryKey>>;
  evaluationFiles: any[];
  workHardeningFiles: any[];
  newHireFiles: any[];
  jsaFiles: any[];
  onCreate: () => void;
  onOpenEvaluation: (evaluationId: string) => void;
  onDeleteEvaluation: (evaluationId: string) => void;
  onSwipeableWillOpen: (ref: Swipeable | null) => void;
  onOpenJsa?: (jsaId: string) => void;
};

const EmployeeFilesHub = ({
  isTablet,
  activeCategory,
  setActiveCategory,
  evaluationFiles,
  workHardeningFiles,
  newHireFiles,
  jsaFiles,
  onCreate,
  onOpenEvaluation,
  onDeleteEvaluation,
  onSwipeableWillOpen,
  onOpenJsa,
}: Props) => {
  const fileCategories = useMemo<FileCategory[]>(
    () => [
      {
        key: "all",
        title: "All Files",
        icon: "folder",

        count:
          evaluationFiles.length +
          workHardeningFiles.length +
          newHireFiles.length +
          jsaFiles.length,
      },
      {
        key: "jsas",
        title: "JSA Files",
        icon: "shield",
        count: jsaFiles.length,
      },

      {
        key: "evaluations",
        title: "Evaluations",
        icon: "clipboard",
        count: evaluationFiles.length,
      },

      {
        key: "workHardening",
        title: "Work Hardening",
        icon: "activity",
        count: workHardeningFiles.length,
      },

      {
        key: "newHire",
        title: "New Hire",
        icon: "user-plus",
        count: newHireFiles.length,
      },
    ],

    [
      evaluationFiles.length,
      workHardeningFiles.length,
      newHireFiles.length,
      jsaFiles?.length,
    ],
  );

  return (
    <View className="w-full">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-2xl font-bold text-neutral-950">
            Employee Files
          </Text>

          <Text className="mt-1 text-sm leading-5 text-neutral-500">
            Evaluations, work hardening, JSA, onboarding, and employee
            documents.
          </Text>
        </View>

        {activeCategory !== "all" && (
          <SinglePressTouchable
            onPress={onCreate}
            className="h-11 w-11 items-center justify-center rounded-full bg-blue-900"
          >
            <Icon name="plus" size={18} color="#FFFFFF" />
          </SinglePressTouchable>
        )}
      </View>

      {isTablet ? (
        <View className="mb-3 flex-row flex-wrap gap-2">
          {fileCategories.map((category) => (
            <View key={category.key} className="w-[19%]">
              <FileCategoryCard
                category={category}
                isTablet={isTablet}
                isActive={activeCategory === category.key}
                onPress={() => setActiveCategory(category.key)}
              />
            </View>
          ))}
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 pb-3"
        >
          {fileCategories.map((category) => (
            <FileCategoryCard
              key={category.key}
              category={category}
              isTablet={isTablet}
              isActive={activeCategory === category.key}
              onPress={() => setActiveCategory(category.key)}
            />
          ))}
        </ScrollView>
      )}

      <EmployeeFilesPanel
        activeCategory={activeCategory}
        categories={fileCategories}
        evaluationFiles={evaluationFiles}
        onOpenEvaluation={onOpenEvaluation}
        onDeleteEvaluation={onDeleteEvaluation}
        onSwipeableWillOpen={onSwipeableWillOpen}
        onOpenJsa={onOpenJsa}
      />
    </View>
  );
};

export default EmployeeFilesHub;
