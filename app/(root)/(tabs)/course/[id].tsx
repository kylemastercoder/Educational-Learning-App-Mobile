/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import ArrowLeft from "react-native-vector-icons/AntDesign";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import CourseContent from "@/components/CourseContent";

interface Course {
  name: string;
  userId: string;
  imageUrl: string;
  description: string;
}

interface Modules {
  name: string;
  content: string;
  moduleNumber: string;
}

interface Quiz {
  id: string;
  quizTitle: string;
}

interface User {
  id: string;
  clerkId: string;
  username: string;
  image?: string;
}

const SpecificCourse = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [modules, setModules] = useState<Modules[] | []>([]);
  const [quiz, setQuiz] = useState<Quiz[] | []>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      const userQuery = query(
        collection(db, "Instructors"),
        where("clerkId", "==", userId)
      );
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        if (userSnapshot.docs.length > 1) {
          console.warn("Multiple users found for this clerkId.");
        }
        const userData = userSnapshot.docs.map((doc) => ({
          id: doc.id,
          clerkId: doc.data().clerkId,
          username: doc.data().username,
          image: doc.data().image,
        }));
        setUserData(userData[0]); // Use the first user found
      } else {
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const fetchModules = async () => {
    try {
      const modulesQuery = query(
        collection(db, "Modules"),
        where("courseId", "==", id)
      );
      const modulesSnapshot = await getDocs(modulesQuery);

      if (!modulesSnapshot.empty) {
        const modulesData = modulesSnapshot.docs.map((doc) => ({
          name: doc.data().name,
          content: doc.data().content,
          moduleNumber: doc.data().moduleNumber,
          courseId: doc.data().courseId,
        }));

        const sortedModules = modulesData.sort((a, b) => {
          return parseInt(a.moduleNumber) - parseInt(b.moduleNumber);
        });
        setModules(sortedModules);
      } else {
        console.log("Modules not found.");
      }
    } catch (err) {
      console.error("Error fetching modules data:", err);
    }
  };

  const fetchQuizByCourse = async () => {
    try {
      const quizQuery = query(
        collection(db, "Quizzes"),
        where("courseId", "==", id)
      );
      const quizSnapshot = await getDocs(quizQuery);

      if (!quizSnapshot.empty) {
        const quizData = quizSnapshot.docs.map((doc) => ({
          id: doc.id,
          quizTitle: doc.data().quizTitle,
        }));

        setQuiz(quizData);
      } else {
        console.log("Quiz not found.");
      }
    } catch (err) {
      console.error("Error fetching quiz data:", err);
    }
  };

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!id) return;

      try {
        const courseRef = doc(db, "Courses", id as string);
        const courseDoc = await getDoc(courseRef);

        if (courseDoc.exists()) {
          const courseData = courseDoc.data() as Course;
          setCourseData(courseData);

          // Fetch user data based on userId from the fetched course data
          if (courseData.userId) {
            await fetchUserData(courseData.userId);
          }
        } else {
          console.log("Course not found.");
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
    fetchModules();
    fetchQuizByCourse();
  }, [id]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }
  return (
    <>
      <Tabs.Screen
        options={{
          tabBarStyle: { display: "none" },
          tabBarIcon: () => null,
        }}
      />
      <Stack.Screen
        options={{
          headerTitle: "Module Details",
          headerTintColor: "#111",
          headerLeft: () => (
            <TouchableOpacity
              className="ml-5"
              onPress={() => router.push("/(root)/history")}
            >
              <ArrowLeft name="arrowleft" size={20} color="#111" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView className="p-5">
        <Text className="font-bold text-[17px]">{courseData?.name}</Text>
        <Text className="text-zinc-700">By Admin</Text>
        <Image
          source={{ uri: courseData?.imageUrl }}
          alt="Course Image"
          style={{ height: 150, marginTop: 10, borderRadius: 10 }}
        />
        <Text className="font-semibold text-[16px] mt-3">About Module</Text>
        <Text numberOfLines={4} className="text-[13px]">
          {courseData?.description}
        </Text>
        <CourseContent
          quiz={quiz.length > 0 ? quiz[0] : null}
          modules={modules}
        />
      </ScrollView>
    </>
  );
};

export default SpecificCourse;
