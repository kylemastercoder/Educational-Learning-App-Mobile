/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";

interface Video {
  id: string;
  name: string;
  thumbnail: string;
  description: number;
  method: string;
  videoUrl: string;
}

const VideoList = () => {
  const router = useRouter();
  const [videos, setVideos] = React.useState<Video[]>([]);

  React.useEffect(() => {
    const fetchVideos = async () => {
      try {
        const videoQuery = query(collection(db, "Videos"));
        const videoSnapshot = await getDocs(videoQuery);

        if (!videoSnapshot.empty) {
          const videoDocs = await Promise.all(
            videoSnapshot.docs.map(async (doc) => {
              const videoData = doc.data();
              return {
                id: doc.id,
                name: videoData.name,
                thumbnail: videoData.thumbnail,
                description: videoData.description,
                method: videoData.method,
                videoUrl: videoData.videoUrl,
              };
            })
          );
          // Set all videos at once
          setVideos(videoDocs);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
      }
    };

    fetchVideos();
  }, []);

  return (
    <FlatList
      data={videos}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/videos/${item.id}`)}
          style={{ backgroundColor: "#fff", marginRight: 10, borderRadius: 10 }}
        >
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
