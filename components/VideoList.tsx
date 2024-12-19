/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser";

interface Video {
  id: string;
  name: string;
  thumbnail: string;
  description: number;
  progress: number;
  method: string;
  videoUrl: string;
  isLocked: boolean;
}

const VideoList = () => {
  const router = useRouter();
  const [videos, setVideos] = React.useState<Video[]>([]);

  const { userData } = useGetUser();

  React.useEffect(() => {
    const getViewedVideos = async () => {
      if (!userData?.clerkId) return [];

      try {
        const viewedQuery = query(
          collection(db, "ViewedVideo"),
          where("userId", "array-contains", userData.clerkId)
        );
        const viewedSnapshot = await getDocs(viewedQuery);
        const viewedVideoIds = viewedSnapshot.docs.map(
          (doc) => doc.data().videoId
        ); // Get video IDs of viewed videos
        console.log("Viewed videos:", viewedVideoIds);
        return viewedVideoIds;
      } catch (error) {
        console.error("Error fetching viewed videos:", error);
        return [];
      }
    };

    const fetchVideos = async () => {
      try {
        const videoQuery = query(
          collection(db, "Videos"),
          where("isArchive", "==", false)
        );
        const videoSnapshot = await getDocs(videoQuery);

        if (!videoSnapshot.empty) {
          const viewedVideoIds = await getViewedVideos();
          const videoDocs = videoSnapshot.docs.map((doc) => {
            const videoData = doc.data();
            const isViewed = viewedVideoIds.includes(doc.id);

            return {
              id: doc.id,
              name: videoData.name,
              thumbnail: videoData.thumbnail,
              description: videoData.description,
              method: videoData.method,
              progress: isViewed ? 100 : 0, // Viewed: 100%, Not Viewed: 0%
              videoUrl: videoData.videoUrl,
              isLocked: !isViewed, // Locked if not viewed
            };
          });

          setVideos(videoDocs);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, [userData]);

  return (
    <FlatList
      data={videos}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            if (!item.isLocked) {
              router.push(`/videos/${item.id}`);
            } else {
              alert("Complete the current video to unlock this one.");
            }
          }}
          style={{
            backgroundColor: "#fff",
            marginRight: 10,
            borderRadius: 10,
            opacity: item.isLocked ? 0.6 : 1,
          }}
        >
          <View
            className={`absolute top-0 right-0 rounded-lg px-2 py-1 ${item.progress === 100 ? "bg-green-500" : "bg-red-500"} z-50`}
          >
            <Text className="font-semibold text-[12px] text-white">
              {item.progress === 100 ? "Completed" : "Not Completed"}
            </Text>
          </View>
          <Image
            source={{ uri: item.thumbnail }}
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
              From: {item.method}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default VideoList;
