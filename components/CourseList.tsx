/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser"; // Assuming this hook fetches the user data

interface Course {
  id: string;
  name: string;
  imageUrl: string;
  moduleCount: number;
  progress: number;
  quiz: any;
  quizTaken: boolean;
}

const CourseList = () => {
  const router = useRouter();
  const { userData } = useGetUser(); // Get user data
  const [courses, setCourses] = React.useState<Course[]>([]);

  React.useEffect(() => {
    const getQuizByCourseId = async (courseId: string) => {
      try {
        const q = query(
          collection(db, "Quizzes"),
          where("courseId", "==", courseId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        }

        const getQuizById = async (quizId: string) => {
          try {
            const quizDoc = await getDoc(doc(db, "Quizzes", quizId));
            if (quizDoc.exists()) {
              return { id: quizDoc.id, ...quizDoc.data() };
            }
            return null;
          } catch (error) {
            console.error("Error fetching quiz:", error);
            return null;
          }
        };

        getQuizById(querySnapshot.docs[0].id);
        return null;
      } catch (error) {
        console.error("Error fetching quiz:", error);
        return null;
      }
    };

    const getModules = async (courseId: string) => {
      try {
        const q = query(
          collection(db, "Modules"),
          where("courseId", "==", courseId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const moduleDocs = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return {
            status: 200,
            modules: moduleDocs,
          };
        }
        return { status: 404, modules: [] };
      } catch (error) {
        console.error("Error fetching modules:", error);
        return { status: 500, modules: [] };
      }
    };

    const getViewedCourses = async () => {
      if (!userData?.clerkId) return []; // Ensure userId is available

      try {
        const viewedQuery = query(
          collection(db, "ViewedCourse"),
          where("userId", "array-contains", userData.clerkId)
        );
        const viewedSnapshot = await getDocs(viewedQuery);
        const viewedCourseIds = viewedSnapshot.docs.map(
          (doc) => doc.data().courseId
        ); // Get course IDs of viewed courses
        return viewedCourseIds;
      } catch (error) {
        console.error("Error fetching viewed courses:", error);
        return [];
      }
    };

    const getViewedQuiz = async (quizId: string) => {
      if (!userData?.clerkId) return false;

      try {
        const viewedQuizQuery = query(
          collection(db, "QuizScore"),
          where("quizId", "==", quizId),
          where("userId", "==", userData.clerkId) // Fetch quiz taken by the user
        );
        const viewedQuizSnapshot = await getDocs(viewedQuizQuery);
        return !viewedQuizSnapshot.empty; // If empty, quiz hasn't been taken
      } catch (error) {
        console.error("Error fetching viewed quiz:", error);
        return false;
      }
    };

    const fetchCourses = async () => {
      try {
        const courseQuery = query(
          collection(db, "Courses"),
          where("isArchive", "==", false)
        );
        const courseSnapshot = await getDocs(courseQuery);

        if (!courseSnapshot.empty) {
          const viewedCourseIds = await getViewedCourses(); // Fetch viewed courses IDs

          // Use `Promise.all` to handle multiple async calls to `getModules`, `getQuizByCourseId`, and `getViewedQuiz`
          const courseDocs = await Promise.all(
            courseSnapshot.docs.map(async (doc) => {
              const courseData = doc.data();
              const modulesResponse = await getModules(doc.id);
              const quizResponse = await getQuizByCourseId(doc.id);
              const totalModules = modulesResponse.modules.length || 0;

              // Determine progress based on viewed courses
              const isViewed = viewedCourseIds.includes(doc.id);
              const progress =
                totalModules === 0
                  ? 0 // If there are no modules, set progress to 0
                  : isViewed
                    ? Math.floor((totalModules / totalModules) * 100) // If viewed, set progress to 100%
                    : 0; // If not viewed, progress is 0%

              // Get quiz status for the course
              const quizTaken =
                quizResponse && quizResponse.length > 0
                  ? await getViewedQuiz(quizResponse[0].id)
                  : false;

              return {
                id: doc.id,
                name: courseData.name,
                imageUrl: courseData.imageUrl,
                moduleCount: totalModules,
                progress: progress,
                quiz: quizResponse, // Add quiz data to the course object
                quizTaken: quizTaken, // Store quiz taken status
              };
            })
          );

          const sortedCourses = courseDocs.sort((a, b) => {
            const aNum = parseInt(a.name.match(/^\D*(\d+)/)?.[1] || "0", 10);
            const bNum = parseInt(b.name.match(/^\D*(\d+)/)?.[1] || "0", 10);

            return aNum - bNum;
          });

          // Set all courses at once
          setCourses(sortedCourses);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, [userData]);

  return (
    <FlatList
      data={courses}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/course/${item.id}`)}
          style={{ backgroundColor: "#fff", marginRight: 10, borderRadius: 10 }}
        >
          <View className="relative">
            <View
              className={`absolute top-0 right-0 rounded-lg px-2 py-1 ${item.progress === 100 && item.quizTaken ? "bg-green-500" : "bg-red-500"} z-50`}
            >
              <Text className="font-semibold text-[12px] text-white">
                {item.progress === 100 && item.quizTaken
                  ? "Completed"
                  : "Not Completed"}
              </Text>
            </View>
            <Image
              source={{ uri: item.imageUrl }}
              style={{
                width: 210,
                height: 120,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
              }}
            />
          </View>
          <View style={{ padding: 10 }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ width: 150, fontSize: 14 }}
            >
              {item.name}
            </Text>
            <Text
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: "bold",
                color: "gray",
              }}
            >
              {item.moduleCount} topics
            </Text>
            <View className="w-full h-2 bg-gray-300 rounded-full mt-2">
              <View
                style={{ width: `${item.progress}%` }} // Set progress width based on calculated progress
                className="h-full bg-green-500 rounded-full"
              />
            </View>
            <Text className="self-start text-xs mt-1">{item.progress}%</Text>
            <TouchableOpacity
              onPress={() =>
                item.progress === 100 &&
                item.quiz &&
                !item.quizTaken &&
                router.push(`/quizzes/${item.quiz[0].id}`)
              }
            >
              <Text
                style={{
                  color: "#fff",
                  backgroundColor:
                    item.quizTaken || item.progress !== 100 || !item.quiz
                      ? "#777"
                      : "#22c55e", // Disabled color if quiz is taken or course is not completed
                  padding: 5,
                  borderRadius: 5,
                  textAlign: "center",
                  marginTop: 5,
                }}
              >
                {item.quizTaken
                  ? "Quiz Taken"
                  : item.progress === 100 || item.quiz
                    ? "Take Assessment"
                    : "No Quiz Available"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default CourseList;
