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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SummaryProgressCard from "@/components/SummaryProgressCard";
import { useGetUser } from "@/hooks/getUser";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { icons } from "@/constants";
import { db } from "@/config/FirebaseConfig";

const Home = () => {
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
    <SafeAreaView className="bg-general-500 px-5 h-screen">
      <ScrollView>
        <View className="flex flex-row items-center justify-between my-5">
          <Text className="text-2xl font-JakartaExtraBold">
            Welcome, {firstName} 👋
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="justify-center items-center w-10 h-10 rounded-full bg-white"
          >
            <Image source={icons.out} className="w-4 h-4" />
          </TouchableOpacity>
        </View>
        <View className="space-y-3">
          <Text className="text-center text-xl font-JakartaExtraBold mb-3">
            Learn C Language
          </Text>
          <SummaryProgressCard
            title={`Prepare by Topics`}
            description="C"
            buttonLabel="Continue Preparation"
            progress={overallProgress}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
