import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import Play from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";

const CourseContent = ({ modules }: { modules: any }) => {
  const router = useRouter();
  return (
    <View className="mt-3 pb-40">
      <Text className="font-semibold text-[16px]">Course Content</Text>
      <FlatList
        className="mt-2"
        data={modules}
        renderItem={({ item, index }) => (
          <View className="flex-row justify-between bg-white items-center rounded-lg mb-3 p-5">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg text-zinc-600 mr-3">
                0{index + 1}
              </Text>
              <Text className="font-semibold text-[15px] w-[180px]">
                {item.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push(`/module/${item.courseId}`)}
            >
              <Play name="play" size={20} color="green" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default CourseContent;
