/* eslint-disable prettier/prettier */
import { useOAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { isLoaded } = useUser();
  const router = useRouter();

  const saveUserToFirebase = async (userId: string) => {
    try {
      const userDocRef = doc(db, "Users", userId);
      // Save only the userId in Firestore
      await setDoc(userDocRef, { clerkId: userId }, { merge: true });
      console.log("User saved to Firebase successfully.");
    } catch (error) {
      console.error("Error saving user to Firebase:", error);
      Alert.alert("Error", "Failed to save user data. Please try again.");
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) {
      Alert.alert("Error", "Clerk is not loaded. Please try again.");
      return;
    }

    try {
      const result = await startOAuthFlow();

      if (result && result.createdSessionId) {
        console.log("OAuth completed successfully:", result);
        const userId = result.createdSessionId;

        // Save only the userId to Firebase
        await saveUserToFirebase(userId);

        Alert.alert("Success", "You are logged in successfully!");
        router.replace("/(root)/(tabs)/home");
      } else {
        console.log("OAuth result:", result);
        Alert.alert("Error", "OAuth process failed.");
      }
    } catch (error: any) {
      console.error("Error during OAuth flow:", error);
      Alert.alert("Error", "Google sign-in failed. Please try again.");
    }
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
