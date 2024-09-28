import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const SummaryProgressCard = ({
  progress,
  title,
  description,
  buttonLabel,
  className,
}: {
  progress: number;
  title: string;
  description: string;
  buttonLabel: string;
  className?: string;
}) => {
  return (
    <View className={`border border-gray-300 rounded-md p-4 ${className}`}>
      <Text className="text-base font-semibold mb-2">{title}</Text>
      <Text className="text-2xl font-bold">{description}</Text>

      <View className="w-full h-2 bg-gray-300 rounded-full mt-2">
        <View
          style={{ width: `${progress}%` }}
          className="h-full bg-green-500 rounded-full"
        />
      </View>
      <Text className="self-start text-xs mt-1">{progress}%</Text>
      <TouchableOpacity className="w-full bg-green-500 rounded-full p-3 mt-4 flex-row justify-center items-center">
        <Text className="text-white font-semibold">{buttonLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SummaryProgressCard;
