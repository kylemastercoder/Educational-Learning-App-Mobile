import SummaryProgressCard from "@/components/SummaryProgressCard";
import { icons } from "@/constants";
import { useGetUser } from "@/hooks/getUser";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
// import { Link } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Home = () => {
  const { userData } = useGetUser();
  const firstName = userData?.name.split(" ")[0];
  const { signOut } = useAuth();
  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };
  return (
    <SafeAreaView className="bg-general-500 px-5 h-screen">
      <ScrollView>
        <View className="flex flex-row items-center justify-between my-5">
          <Text className="text-2xl font-JakartaExtraBold">
            Welcome, {firstName} 👋
          </Text>
          <TouchableOpacity
            onPress={handleSignOut}
            className="justify-center items-center w-10 h-10 rounded-full bg-white"
          >
            <Image source={icons.out} className="w-4 h-4" />
          </TouchableOpacity>
        </View>
        <View className="space-y-3">
          <Text className="text-center text-xl font-JakartaExtraBold mb-3">
            Learn C Language
          </Text>
          <SummaryProgressCard
            title="PREPARE BY TOPICS"
            description="C"
            buttonLabel="Continue Preparation"
            progress={35}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
