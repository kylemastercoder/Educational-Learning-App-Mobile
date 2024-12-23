/* eslint-disable prettier/prettier */
import { router } from "expo-router";
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
      <Text className="text-xs text-justify text-muted-foreground">
        Ready to conquer the world of programming? Our C programming course
        provides a comprehensive and engaging learning experience, designed to
        guide you from beginner to expert. Learn from clear explanations,
        interactive exercises, and engaging video lectures. Test your knowledge
        with our robust quiz system and challenge yourself with practical coding
        exercises. Our course equips you with the essential tools to master C
        programming and unlock a world of exciting career opportunities in
        software development.
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
