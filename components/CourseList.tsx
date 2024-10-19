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
        const courseQuery = query(collection(db, "Courses"));
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
              const progress = isViewed
                ? Math.floor((totalModules / totalModules) * 100)
                : 0; // You can change this logic if you have a specific progress metric

              return {
                id: doc.id,
                name: courseData.name,
                imageUrl: courseData.imageUrl,
                moduleCount: totalModules,
                progress: progress,
              };
            })
          );

          // Set all courses at once
          setCourses(courseDocs);
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
          <Image
            source={{ uri: item.imageUrl }}
            style={{
              width: 210,
              height: 120,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
            }}
          />
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
              {item.moduleCount} modules
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
