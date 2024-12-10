/* eslint-disable prettier/prettier */
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import Play from "react-native-vector-icons/AntDesign";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";

const CourseContent = ({ modules, quiz }: { modules: any; quiz: any }) => {
  const { userData } = useGetUser(); // Get user data
  const router = useRouter();
  const [viewedModules, setViewedModules] = useState<string[]>([]);

  useEffect(() => {
    const fetchViewedModules = async () => {
      if (!userData?.clerkId || modules.length === 0) return;

      try {
        const moduleQuery = query(
          collection(db, "ViewedCourse"),
          where("userId", "array-contains", userData.clerkId),
          where("courseId", "==", modules[0].courseId)
        );
        const snapshot = await getDocs(moduleQuery);

        const viewedModuleIds = snapshot.docs.map((doc) => doc.data().moduleId);
        setViewedModules(viewedModuleIds); // Update the viewed modules
      } catch (error) {
        console.error("Error fetching viewed modules:", error);
        setViewedModules([]);
      }
    };

    fetchViewedModules();
  }, [modules, userData]);

  const isModuleAccessible = (index: number) => {
    if (index === 0) return true;
    return viewedModules.includes(modules[index - 1]?.id);
  };

  return (
    <View className="mt-3 pb-40">
      <Text className="font-semibold text-[16px]">Module Content</Text>

      {modules.length === 0 ? (
        <Text className="mt-2 text-center text-[18px] font-semibold text-red-500">
          No modules found.
        </Text>
      ) : (
        <FlatList
          className="mt-2"
          data={modules}
          renderItem={({ item, index }) => (
            <View className="flex-row justify-between bg-white items-center rounded-lg mb-3 p-5">
              <View className="flex-row items-center">
                <Text className="font-bold text-lg text-zinc-600 mr-3">
                  {String(index + 1).padStart(2, "0")}
                </Text>
                <Text className="font-semibold text-[15px] w-[180px]">
                  {item.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={
                  isModuleAccessible(index)
                    ? () => router.push(`/module/${item.courseId}`)
                    : undefined
                }
                disabled={!isModuleAccessible(index)}
              >
                <Play
                  name="play"
                  size={20}
                  color={isModuleAccessible(index) ? "green" : "gray"}
                />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

export default CourseContent;
