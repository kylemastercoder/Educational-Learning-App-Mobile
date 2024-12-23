/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
  ToastAndroid,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SummaryProgressCard from "@/components/SummaryProgressCard";
import { useGetUser } from "@/hooks/getUser";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { icons } from "@/constants";
import { db } from "@/config/FirebaseConfig";
import React from "react";

const Home = () => {
  const [open, setOpen] = useState(false);
  const { userData } = useGetUser();
  const firstName = userData?.name.split(" ")[0];
  const { signOut } = useAuth();
  const [overallProgress, setOverallProgress] = useState(0);

  if (userData?.status === "Rejected") {
    ToastAndroid.show(
      "Your account has been rejected. Please contact support.",
      ToastAndroid.LONG
    );
    signOut();
    router.replace("/(auth)/sign-in");
  }

  useEffect(() => {
    const calculateOverallProgress = async () => {
      try {
        // 1. Get total courses
        const courseQuery = query(collection(db, "Courses"));
        const courseSnapshot = await getDocs(courseQuery);
        const totalCourses = courseSnapshot.size;

        // 2. Get total users
        const usersQuery = query(collection(db, "Users"));
        const usersSnapshot = await getDocs(usersQuery);
        const totalUsers = usersSnapshot.size;
        console.log("Total Users: ", totalUsers);

        // 3. Get total viewed courses for the current user
        if (!userData?.clerkId) {
          setOverallProgress(0);
          return;
        }

        const viewedCourseQuery = query(
          collection(db, "ViewedCourse"),
          where("userId", "array-contains", userData.clerkId) // Check for the specific userId
        );

        const viewedCoursesSnapshot = await getDocs(viewedCourseQuery);
        const totalViewedCourses = viewedCoursesSnapshot.size; // Count of courses viewed by the user

        // 4. Calculate the overall progress
        const maxPossibleViews = totalCourses; // Maximum possible views if the user viewed all courses
        if (maxPossibleViews === 0) {
          setOverallProgress(0);
          return;
        }

        const progress = Math.min(
          (totalViewedCourses / maxPossibleViews) * 100,
          100
        );

        setOverallProgress(parseFloat(progress.toFixed(2)));
      } catch (error) {
        console.error("Error calculating overall progress: ", error);
      }
    };

    calculateOverallProgress();
  }, [userData]);

  useEffect(() => {
    console.log("User:", userData);
  }, [userData]);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  return (
    <>
      <Modal
        visible={open}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-white rounded-lg p-5 w-4/5">
            <Text className="font-semibold text-md">
              Are you sure you want to logout?
            </Text>
            <View className="flex items-center gap-2 flex-row mt-2 justify-end">
              <TouchableOpacity
                className="bg-zinc-600 px-2 py-1 rounded-md"
                onPress={() => setOpen(false)}
              >
                <Text className="text-white text-center">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-green-600 px-2 py-1 rounded-md"
                onPress={handleSignOut}
              >
                <Text className="text-white text-center">Yes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <SafeAreaView className="bg-general-500 px-5 h-screen">
        <ScrollView>
          <View className="flex flex-row items-center justify-between my-5">
            <Text className="text-2xl font-JakartaExtraBold">
              Welcome, {firstName || "Student"} 👋
            </Text>
            <TouchableOpacity
              onPress={() => setOpen(true)}
              className="justify-center items-center w-10 h-10 rounded-full bg-white"
            >
              <Image source={icons.out} className="w-4 h-4" />
            </TouchableOpacity>
          </View>
          <View className="space-y-3">
            <Text className="text-center text-xl font-JakartaExtraBold mb-3">
              Learn C, C++ and C# Programming Language
            </Text>
            <SummaryProgressCard
              title={`Prepare by Topics`}
              description="C, C++, C#"
              buttonLabel="Continue Preparation"
              progress={overallProgress}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Home;
