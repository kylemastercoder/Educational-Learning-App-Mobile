/* eslint-disable prettier/prettier */
import { router } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const SummaryProgressCard = ({
  progress,
  title,
  subTitle,
  buttonLabel,
  className,
  content,
}: {
  progress: number;
  title: string;
  subTitle: string;
  buttonLabel: string;
  content: string;
  className?: string;
}) => {
  return (
    <View className={`border border-gray-300 rounded-md p-4 ${className}`}>
      <Text className="text-base font-semibold mb-2">{subTitle}</Text>
      <Text className="text-xs text-left text-muted-foreground mb-2">
        {content}
      </Text>

      <View className="w-full h-2 bg-gray-300 rounded-full">
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-green-500 rounded-full"
        />
      </View>
      <Text className="self-start text-xs mt-1">{progress}%</Text>
      <TouchableOpacity
        onPress={() => router.push("/(root)/(tabs)/history")}
        className="w-full bg-green-500 rounded-full p-3 mt-4 flex-row justify-center items-center"
      >
        <Text className="text-white font-semibold">{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SummaryProgressCard;
