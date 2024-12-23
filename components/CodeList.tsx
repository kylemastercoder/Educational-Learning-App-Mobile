/* eslint-disable prettier/prettier */
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import RenderHTML from "react-native-render-html";

interface CodeContent {
  id: string;
  title: string;
  description: string;
  programmingLanguage: string;
  thumbnail: string;
}

const CodeList = () => {
  const router = useRouter();
  const [codes, setCodes] = React.useState<CodeContent[]>([]);

  React.useEffect(() => {
    const fetchCodes = async () => {
      try {
        const codeQuery = query(
          collection(db, "CodeChallenges"),
          where("isArchive", "==", false)
        );
        const codeSnapshot = await getDocs(codeQuery);

        if (!codeSnapshot.empty) {
          const codeDocs = await Promise.all(
            codeSnapshot.docs.map(async (doc) => {
              const codeData = doc.data();
              return {
                id: doc.id,
                title: codeData.title,
                description: codeData.description,
                thumbnail: codeData.thumbnail,
                programmingLanguage: codeData.programmingLanguage,
              };
            })
          );
          // Set all codes at once
          setCodes(codeDocs);
        }
      } catch (error) {
        console.error("Error fetching codes:", error);
      }
    };

    fetchCodes();
  }, []);
  return (
    <FlatList
      data={codes}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/codes/${item.id}`)}
          style={{
            backgroundColor: "#fff",
            marginRight: 10,
            borderRadius: 10,
            position: "relative",
          }}
        >
          <View
            className={`absolute z-50 top-0 right-0 rounded-lg px-2 py-1 ${
              item.programmingLanguage === "c"
                ? "bg-green-500"
                : item.programmingLanguage === "c#"
                  ? "bg-blue-500"
                  : "bg-orange-500"
            }`}
          >
            <Text className="font-semibold text-[12px] text-white">
              {item.programmingLanguage === "c"
                ? "C Language"
                : item.programmingLanguage === "c#"
                  ? "C# Language"
                  : "C++ Language"}
            </Text>
          </View>

          <Image
            source={{ uri: item.thumbnail }}
            style={{
              width: "100%",
              height: 120,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
            }}
          />
          <View style={{ padding: 10 }}>
            <View>
              <Text style={{ width: 150, fontSize: 14, fontWeight: "500" }}>
                {item.title}
              </Text>
            </View>
            <View className="w-60">
              <RenderHTML
                contentWidth={50}
                source={{ html: item?.description || "" }}
                tagsStyles={{
                  li: { marginTop: 0, marginLeft: 5 },
                  p: { marginTop: 0 },
                  h1: { marginTop: 0 },
                }}
              />
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default CodeList;
