/* eslint-disable prettier/prettier */
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import RenderHTML from "react-native-render-html";

interface CodeContent {
  id: string;
  title: string;
  description: string;
}

const CodeList = () => {
  const router = useRouter();
  const [codes, setCodes] = React.useState<CodeContent[]>([]);

  React.useEffect(() => {
    const fetchCodes = async () => {
      try {
        const codeQuery = query(collection(db, "CodeChallenges"));
        const codeSnapshot = await getDocs(codeQuery);

        if (!codeSnapshot.empty) {
          const codeDocs = await Promise.all(
            codeSnapshot.docs.map(async (doc) => {
              const codeData = doc.data();
              return {
                id: doc.id,
                title: codeData.title,
                description: codeData.description,
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
            padding: 10,
          }}
        >
          <View>
            <Text style={{ width: 150, fontSize: 16, fontWeight: "500" }}>
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
        </TouchableOpacity>
      )}
    />
  );
};

export default CodeList;
