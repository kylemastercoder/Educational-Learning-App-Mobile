/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import ArrowLeft from "react-native-vector-icons/AntDesign";
import RenderHTML from "react-native-render-html";
import CodeRunner from "@/components/CodeRunner";
import { useGetUser } from "@/hooks/getUser";

interface CodeContent {
  id: string;
  title: string;
  description: string;
  programmingLanguage: string;
  correctOutput: string;
}

const SpecificCode = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [codeData, setCodeData] = useState<CodeContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData: user } = useGetUser();

  useEffect(() => {
    const fetchCodeData = async () => {
      if (!id) return;

      try {
        const codeRef = doc(db, "CodeChallenges", id as string);
        const codeDoc = await getDoc(codeRef);

        if (codeDoc.exists()) {
          const codeData = codeDoc.data() as CodeContent;
          setCodeData(codeData);
        } else {
          setError("Code challenge not found.");
        }
      } catch (err) {
        console.error("Error fetching code challenge data:", err);
        setError("Failed to fetch code challenge data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCodeData();
  }, [id]);

  const trackCodeView = async (userId: string, codeId: string) => {
    try {
      const viewedCodeQuery = query(
        collection(db, "ViewedCode"),
        where("codeId", "==", codeId),
        where("userId", "array-contains", userId) // Check if userId already exists in the userId array
      );

      const querySnapshot = await getDocs(viewedCodeQuery);

      if (!querySnapshot.empty) {
        console.log("User has already viewed this code challenge.");
        return; // Exit the function if the document already exists
      }

      // If no document exists, add a new one
      const viewedCourseRef = collection(db, "ViewedCode");
      await addDoc(viewedCourseRef, {
        codeId: codeId,
        userId: arrayUnion(userId),
      });
    } catch (error) {
      console.error("Error tracking video view:", error);
    }
  };

  useEffect(() => {
    if (codeData && user) {
      trackCodeView(user.clerkId, id as string);
    }
  }, [codeData, user]);

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
          headerTitle: "Code Challenge Details",
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
        <View className="pb-20">
          <Text className="text-[20px] font-semibold mb-2">
            {codeData?.title}
          </Text>
          <RenderHTML
            contentWidth={100}
            source={{ html: codeData?.description || "" }}
            tagsStyles={{
              li: { marginTop: 0, marginLeft: 5 },
              p: { marginTop: 0 },
              h1: { marginTop: 0 },
            }}
          />
          <CodeRunner
            programmingLanguage={codeData?.programmingLanguage || ""}
            correctOutput={codeData?.correctOutput || ""}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default SpecificCode;
