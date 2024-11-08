/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import ArrowLeft from "react-native-vector-icons/AntDesign";
import {
  addDoc,
  arrayUnion,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import RenderHTML from "react-native-render-html";
import { useGetUser } from "@/hooks/getUser";

interface Modules {
  name: string;
  content: string;
  moduleNumber: string;
  imagesUrl: string[];
}

const CourseChapter = () => {
  const { userData } = useGetUser();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [modules, setModules] = useState<Modules[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0); // Track current module index
  const moduleRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchModules = async () => {
      if (!id) return;
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
            imagesUrl: doc.data().imagesUrl || [],
          }));
          setModules(modulesData);
        } else {
          setError("Modules not found.");
        }
      } catch (err) {
        console.error("Error fetching modules data:", err);
        setError("Failed to fetch modules data.");
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, [id]);

  const handleNextModule = async () => {
    if (currentIndex < modules.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      moduleRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    } else {
      const courseId = id; // Assuming the courseId is the same as the module's courseId
      const userId = userData?.clerkId; // Using optional chaining to avoid undefined

      if (!userId) {
        console.error("User ID is undefined.");
        return; // Exit the function if userId is not available
      }

      try {
        // Check if the userId and courseId combination already exists in ViewedCourse
        const viewedCourseQuery = query(
          collection(db, "ViewedCourse"),
          where("courseId", "==", courseId),
          where("userId", "array-contains", userId) // Check if userId already exists in the userId array
        );

        const querySnapshot = await getDocs(viewedCourseQuery);

        if (!querySnapshot.empty) {
          setTimeout(() => {
            router.push("/(root)/history");
          }, 2000);
          return; // Exit the function if the document already exists
        }

        // If no document exists, add a new one
        const viewedCourseRef = collection(db, "ViewedCourse");
        await addDoc(viewedCourseRef, {
          courseId: courseId,
          userId: arrayUnion(userId), // This will add the userId to the array if it doesn't exist
        });

        ToastAndroid.show(
          "Congratulations! You've completed this module!",
          ToastAndroid.SHORT
        );
        setTimeout(() => {
          router.push("/(root)/history");
        }, 2000);
        console.log("ViewedCourse document added successfully");
      } catch (error) {
        console.error("Error adding document to ViewedCourse: ", error);
      }
    }
  };

  const handlePreviousModule = () => {
    if (currentIndex > 0) {
      const previousIndex = currentIndex - 1;
      setCurrentIndex(previousIndex);
      moduleRef.current?.scrollToIndex({
        animated: true,
        index: previousIndex,
      });
    } else {
      ToastAndroid.show(
        "You are already at the first module.",
        ToastAndroid.SHORT
      );
    }
  };

  const progressPercentage =
    modules.length > 0 ? ((currentIndex + 1) / modules.length) * 100 : 0;

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    ToastAndroid.show(error, ToastAndroid.SHORT);
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
      {/* Progress Bar */}
      <View
        style={{
          width: "100%",
          height: 10,
          backgroundColor: "#e0e0e0",
          marginBottom: 10,
        }}
      >
        <View
          style={{
            width: `${progressPercentage}%`,
            height: "100%",
            backgroundColor: "#32cd32", // Adjust color as needed
          }}
        />
      </View>
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={modules}
        horizontal={true}
        pagingEnabled={true}
        scrollEnabled={false}
        ref={moduleRef} // Attach ref to FlatList
        onScrollToIndexFailed={() => {
          ToastAndroid.show(
            "Scroll error, please try again.",
            ToastAndroid.SHORT
          );
        }}
        renderItem={({ item }) => (
          <ScrollView
            className="h-full"
            style={{
              width: Dimensions.get("screen").width * 1,
              marginRight: 15,
              padding: 10,
            }}
          >
            <Text className="font-semibold text-[18px]">{item.name}</Text>
            {item.imagesUrl?.map((image: string, index: number) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={{ width: "100%", height: 200 }}
              />
            ))}
            <RenderHTML
              contentWidth={100}
              source={{ html: item.content }}
              tagsStyles={{
                li: { marginTop: 0, marginLeft: 5 },
                p: { marginTop: 0 },
                h1: { marginTop: 0 },
              }}
            />
          </ScrollView>
        )}
        keyExtractor={(item, index) => `${item.moduleNumber}-${index}`}
        initialScrollIndex={currentIndex}
      />
      <View className="flex-row justify-center items-center w-[90%] mx-auto mb-[30px]">
        <TouchableOpacity
          onPress={handlePreviousModule}
          className="w-[45%] rounded-md mx-2 py-3 bg-gray-500" // Adjust color as needed
        >
          <Text className="text-center text-white font-semibold">Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleNextModule}
          className="w-[45%] rounded-md mx-2 py-3 bg-emerald-600"
        >
          <Text className="text-center text-white font-semibold">Next</Text>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default CourseChapter;
