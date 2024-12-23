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
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import YoutubePlayer from "react-native-youtube-iframe";
import Video, { VideoRef } from "react-native-video";
import RenderHTML from "react-native-render-html";
import { extractVideoId } from "@/lib/utils";
import { useGetUser } from "@/hooks/getUser";
import * as Updates from "expo-updates";

interface VideoContent {
  id: string;
  name: string;
  userId: string;
  thumbnail: string;
  description: string;
  method: string;
  videoUrl: string;
}

interface User {
  id: string;
  clerkId: string;
  username: string;
  image?: string;
}

const SpecificVideo = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [videoData, setVideoData] = useState<VideoContent | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<VideoRef>(null);
  const { userData: user } = useGetUser();

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
        setError("User not found.");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data.");
    }
  };

  useEffect(() => {
    const fetchVideoData = async () => {
      if (!id) return;

      try {
        const videoRef = doc(db, "Videos", id as string);
        const videoDoc = await getDoc(videoRef);

        if (videoDoc.exists()) {
          const videoData = videoDoc.data() as VideoContent;
          setVideoData(videoData);

          // Fetch user data based on userId from the fetched video data
          if (videoData.userId) {
            await fetchUserData(videoData.userId);
          }
        } else {
          setError("Video not found.");
        }
      } catch (err) {
        console.error("Error fetching video data:", err);
        setError("Failed to fetch video data.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoData();
  }, [id]);

  // Track video views
  const trackVideoView = async (userId: string, videoId: string) => {
    try {
      const viewedVideoQuery = query(
        collection(db, "ViewedVideo"),
        where("videoId", "==", videoId),
        where("userId", "array-contains", userId) // Check if userId already exists in the userId array
      );

      const querySnapshot = await getDocs(viewedVideoQuery);

      if (!querySnapshot.empty) {
        console.log("Video already viewed by this user.");
        return; // Exit the function if the document already exists
      }

      // If no document exists, add a new one
      const viewedCourseRef = collection(db, "ViewedVideo");
      await addDoc(viewedCourseRef, {
        videoId: videoId,
        userId: arrayUnion(userId), // This will add the userId to the array if it doesn't exist
      });
      setTimeout(async () => {
        await Updates.reloadAsync();
      }, 5000);
      ToastAndroid.show("Video viewed successfully", ToastAndroid.SHORT);
    } catch (error) {
      console.error("Error tracking video view:", error);
    }
  };

  useEffect(() => {
    if (videoData && user) {
      trackVideoView(user.clerkId, id as string);
    }
  }, [videoData, userData]);

  const onStateChange = useCallback((state: string) => {
    if (state === "ended") {
      setPlaying(false);
    }
  }, []);

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
          headerTitle: "Video Lecture Details",
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
          <Text className="text-[16px] font-semibold">{videoData?.name}</Text>
          <Text className="text-zinc-700 mb-3">By Admin</Text>
          {videoData?.method === "youtube" ? (
            <YoutubePlayer
              height={185}
              play={playing}
              videoId={extractVideoId(videoData?.videoUrl) || ""}
              onChangeState={onStateChange}
            />
          ) : (
            <Video
              source={{ uri: videoData?.videoUrl }}
              ref={videoRef}
              className="absolute inset-0"
            />
          )}

          <Text className="font-semibold text-[16px] mt-3">
            About Video Lecture
          </Text>
          <RenderHTML
            contentWidth={100}
            source={{ html: videoData?.description || "" }}
            tagsStyles={{
              li: { marginTop: 0, marginLeft: 5 },
              p: { marginTop: 0 },
              h1: { marginTop: 0 },
            }}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default SpecificVideo;
