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
  const [allModulesCompleted, setAllModulesCompleted] = useState(false); // State to track module completion

  useEffect(() => {
    const checkModulesCompletion = async () => {
      if (!userData?.clerkId || modules.length === 0) return;

      try {
        const completedQuery = query(
          collection(db, "ViewedCourse"),
          where("userId", "array-contains", userData.clerkId),
          where("courseId", "==", modules[0].courseId)
        );
        const completedSnapshot = await getDocs(completedQuery);

        const completedModuleIds = completedSnapshot.docs.map(
          (doc) => doc.data().moduleId
        );

        // Check if all module IDs are in the completed list
        const allCompleted = modules.every((module: any) =>
          completedModuleIds.includes(module.id)
        );

        setAllModulesCompleted(allCompleted);
        console.log("All modules completed:", allCompleted);
      } catch (error) {
        console.error("Error checking module completion:", error);
        setAllModulesCompleted(false);
      }
    };

    checkModulesCompletion();
  }, [modules, userData]);

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
                onPress={() => router.push(`/module/${item.courseId}`)}
              >
                <Play name="play" size={20} color="green" />
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
        />
      )}

      {/* Render Quiz Section */}
      {quiz && quiz.quizTitle && (
        <View className="flex-row justify-between bg-white items-center rounded-lg p-5">
          <View className="flex-row items-center">
            <Text className="font-bold text-[15px] text-zinc-600 mr-3">
              Quiz:
            </Text>
            <Text className="font-semibold text-[15px] w-[180px]">
              {quiz.quizTitle}
            </Text>
          </View>
          <TouchableOpacity
            onPress={
              allModulesCompleted
                ? () => router.push(`/quizzes/${quiz.id}`)
                : undefined
            }
            disabled={!allModulesCompleted}
          >
            <Play
              name="play"
              size={20}
              color={allModulesCompleted ? "blue" : "gray"}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CourseContent;
