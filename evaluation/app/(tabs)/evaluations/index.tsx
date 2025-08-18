import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EvaluationRow from "@/app/(tabs)/evaluations/EvaluationRow";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getServerIP from "@/app/requests/NetworkAddress";
import axios from "axios";

const Evaluations = () => {
  const [status, setStatus] = useState("in_progress");
  const [evaluations, setEvaluations] = useState<any>([]);

  useEffect(() => {
    const GetEvaluations = async () => {
      const token = await AsyncStorage.getItem("token");
      const baseUrl = await getServerIP();
      axios
        .get(`${baseUrl}/evaluations`, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => setEvaluations(res?.data))
        .catch((err) => {
          console.log(err);
        });
    };
    GetEvaluations();
  }, [status]);

  return (
    <SafeAreaView className="p-6 bg-white h-full">
      <View className="flex-row border border-neutral-400 h-8 rounded-lg my-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setStatus("in_progress")}
          className={`${
            status === "in_progress" && "bg-[#1a237e]"
          } border-neutral-600 w-1/2 rounded-lg justify-center items-center`}
        >
          <Text
            className={`${
              status === "in_progress" && "text-neutral-50"
            } font-inter`}
          >
            In Progress
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setStatus("complete")}
          className={`${
            status === "complete" && "bg-[#1a237e]"
          } w-1/2 rounded-lg justify-center items-center`}
        >
          <Text
            className={`font-inter ${
              status === "complete" && "text-neutral-50"
            }`}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView className="my-4">
        {evaluations
          .filter((eva: any) => eva.status === status)
          .map((file: any) => (
            <EvaluationRow key={file._id} file={file} includeName />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Evaluations;
