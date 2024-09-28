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
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import ArrowLeft from "react-native-vector-icons/AntDesign";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import RenderHTML from "react-native-render-html";

interface Modules {
  name: string;
  content: string;
  moduleNumber: string;
}

const CourseChapter = () => {
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

  const handleNextModule = () => {
    if (currentIndex < modules.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      moduleRef.current?.scrollToIndex({ animated: true, index: nextIndex });
    } else {
      ToastAndroid.show("This is the last module", ToastAndroid.SHORT);
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
            <TouchableOpacity className="ml-5" onPress={() => router.back()}>
              <ArrowLeft name="arrowleft" size={20} color="#111" />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity className="mr-5">
              <Text className="text-black">Edit</Text>
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
        keyExtractor={(item) => item.moduleNumber}
      />
      <TouchableOpacity
        onPress={handleNextModule}
        className="w-[90%] mx-auto mb-[30px] rounded-md py-3 bg-emerald-600"
      >
        <Text className="text-center text-white font-semibold">Next</Text>
      </TouchableOpacity>
    </>
  );
};

export default CourseChapter;
