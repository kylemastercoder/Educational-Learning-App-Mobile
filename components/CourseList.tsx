/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser"; // Assuming this hook fetches the user data

interface Course {
  id: string;
  name: string;
  imageUrl: string;
  moduleCount: number;
  progress: number; // Added progress field
}

const CourseList = () => {
  const router = useRouter();
  const { userData } = useGetUser(); // Get user data
  const [courses, setCourses] = React.useState<Course[]>([]);

  React.useEffect(() => {
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
          where("userId", "array-contains", userData.clerkId) // Fetch viewed courses for the user
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

    const fetchCourses = async () => {
      try {
        const courseQuery = query(
          collection(db, "Courses"),
          where("isArchive", "==", false)
        );
        const courseSnapshot = await getDocs(courseQuery);

        if (!courseSnapshot.empty) {
          const viewedCourseIds = await getViewedCourses(); // Fetch viewed courses IDs

          // Use `Promise.all` to handle multiple async calls to `getModules`
          const courseDocs = await Promise.all(
            courseSnapshot.docs.map(async (doc) => {
              const courseData = doc.data();
              const modulesResponse = await getModules(doc.id);
              const totalModules = modulesResponse.modules.length || 0;

              // Determine progress based on viewed courses
              const isViewed = viewedCourseIds.includes(doc.id);
              const progress =
                totalModules === 0
                  ? 0 // If there are no modules, set progress to 0
                  : isViewed
                    ? Math.floor((totalModules / totalModules) * 100) // If viewed, set progress to 100%
                    : 0; // If not viewed, progress is 0%

              return {
                id: doc.id,
                name: courseData.name,
                imageUrl: courseData.imageUrl,
                moduleCount: totalModules,
                progress: progress,
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
  }, [userData]); // Added userData as a dependency to re-fetch courses when user data changes

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
              className={`absolute top-0 right-0 rounded-lg px-2 py-1 ${item.progress === 100 ? "bg-green-500" : "bg-red-500"} z-50`}
            >
              <Text className="font-semibold text-[12px] text-white">
                {item.progress === 100 ? "Completed" : "Not Completed"}
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
            <Text style={{ width: 150, fontSize: 14 }}>{item.name}</Text>
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
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default CourseList;
