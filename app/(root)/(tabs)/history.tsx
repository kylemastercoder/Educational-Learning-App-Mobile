/* eslint-disable prettier/prettier */
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import CourseList from "@/components/CourseList";
import VideoList from "@/components/VideoList";
import CodeList from "@/components/CodeList";

const History = () => {
  return (
    <SafeAreaView className="flex-1 p-5 pb-32">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mt-10">
          <View className="flex-row mb-2 justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">Modules</Text>
          </View>
          <CourseList />
        </View>
        <View className="mt-5">
          <View className="flex-row mb-2 justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">
              Video Lectures
            </Text>
          </View>
          <VideoList />
        </View>
        <View className="mt-5">
          <View className="flex-row mb-2 justify-between items-center">
            <Text className="text-zinc-600 font-semibold text-lg">
              Coding Challenges
            </Text>
          </View>
          <CodeList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default History;
