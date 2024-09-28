/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";

interface Course {
  id: string;
  name: string;
  imageUrl: string;
  moduleCount: number;
}

const CourseList = () => {
  const router = useRouter();
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

    const fetchCourses = async () => {
      try {
        const courseQuery = query(collection(db, "Courses"));
        const courseSnapshot = await getDocs(courseQuery);

        if (!courseSnapshot.empty) {
          // Use `Promise.all` to handle multiple async calls to `getModules`
          const courseDocs = await Promise.all(
            courseSnapshot.docs.map(async (doc) => {
              const courseData = doc.data();
              const modulesResponse = await getModules(doc.id);

              return {
                id: doc.id,
                name: courseData.name,
                imageUrl: courseData.imageUrl,
                moduleCount:
                  modulesResponse.status === 200
                    ? (modulesResponse.modules?.length ?? 0)
                    : 0,
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
  }, []);
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
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default CourseList;
