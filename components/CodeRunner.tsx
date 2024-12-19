/* eslint-disable prettier/prettier */
import { useEffect, useState } from "react";
import {
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import axios from "axios";
import { Audio } from "expo-av";
import { make_request } from "@/app/(api)/gemini";

const CodeRunner = ({ correctOutput }: { correctOutput: string }) => {
  const [code, setCode] = useState(`
#include <stdio.h>

int main() {
    // Your code here
    return 0;
}
  `);
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [explanations, setExplanations] = useState<string[]>([]);

  async function playSound(url: string) {
    const { sound } = await Audio.Sound.createAsync({ uri: url });
    setSound(sound);
    await sound.playAsync();
  }

  useEffect(() => {
    return sound
      ? () => {
          sound?.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const runCode = async () => {
    const clientId = "d5a599f5ed21dbf2a279d51e40054d22"; // JDoodle Client ID
    const clientSecret =
      "2b2e62db3d285fe943c76e43acaa56ff9eebfc5e4318b87d410635742dc882da"; // JDoodle Client Secret
    const scriptLanguage = "c";
    const program = {
      script: code,
      language: scriptLanguage,
      versionIndex: "0", // 0 for the latest version
      clientId: clientId,
      clientSecret: clientSecret,
    };

    setIsLoading(true);
    playSound(
      "https://firebasestorage.googleapis.com/v0/b/educational-webapp.appspot.com/o/sounds%2Floading.mp3?alt=media&token=46337b1c-907f-45cf-b9c3-b2fd5606129d"
    );

    try {
      const response = await axios.post(
        "https://api.jdoodle.com/v1/execute",
        program
      );
      setOutput(response.data.output);

      // Check if the output matches the correct output
      if (response.data.output.trim() === correctOutput.trim()) {
        ToastAndroid.show("Correct output!", ToastAndroid.SHORT);
        playSound(
          "https://firebasestorage.googleapis.com/v0/b/educational-webapp.appspot.com/o/sounds%2Fsuccess.mp3?alt=media&token=184f270d-9df8-4c50-9806-61df35eca7af"
        );
      } else {
        ToastAndroid.show("Incorrect output!", ToastAndroid.SHORT);
        playSound(
          "https://firebasestorage.googleapis.com/v0/b/educational-webapp.appspot.com/o/sounds%2Ferror.mp3?alt=media&token=5c1a1ceb-0a0d-4d9e-812b-8a803bd423ca"
        );
      }
      // Fetch explanations for each line of code
      await fetchExplanations(code);
    } catch (error: any) {
      setOutput(
        "Error running code: " +
          (error.response?.data?.message || error.message)
      );
      playSound(
        "https://firebasestorage.googleapis.com/v0/b/educational-webapp.appspot.com/o/sounds%2Ferror.mp3?alt=media&token=5c1a1ceb-0a0d-4d9e-812b-8a803bd423ca"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch explanations from the AI service
  const fetchExplanations = async (code: string) => {
    try {
      const explanation = await make_request(code);
      if (explanation) {
        const lineExplanations = explanation.split("\n");
        setExplanations(lineExplanations);
      } else {
        console.error("Empty explanation received from make_request.");
        setExplanations(["No explanations available."]);
      }
    } catch (error) {
      console.error("Error fetching explanations:", {
        message: (error as any).message,
        response: (error as any).response?.data,
      });
      setExplanations(["Error fetching explanations"]);
    }
  };

  const handleCodeChange = (text: string) => {
    if (text.endsWith("\n")) {
      text += "    ";
    }
    setCode(text);
  };

  return (
    <View>
      <Text className="text-lg font-semibold mb-3">Write Your Code Here:</Text>
      <TextInput
        className="border border-gray-300 rounded-md p-3 w-full mb-5"
        multiline
        value={code}
        onChangeText={handleCodeChange}
        style={{ minHeight: 200 }}
      />

      <TouchableOpacity
        disabled={isLoading}
        className="w-full py-2 rounded-lg bg-general-400"
        onPress={runCode}
      >
        <Text className="text-white uppercase text-center">
          {isLoading ? "Running..." : "Run Code"}
        </Text>
      </TouchableOpacity>

      {/* Output Section */}
      <View
        className={`mt-5 p-3 ${output === correctOutput.trim() ? "bg-general-400/20" : output.includes("Error") ? "bg-red-500/20" : "bg-red-500/20"} rounded-md`}
      >
        <Text className="font-semibold text-black">Output:</Text>
        <Text
          className={`font-semibold text-sm ${
            output === correctOutput.trim()
              ? "text-green-700"
              : output.includes("Error")
                ? "text-red-500"
                : "text-red-500"
          }`}
        >
          {output || "No output"}
        </Text>
      </View>

      {/* Explanations Section */}
      <View className="mt-5 p-3 bg-gray-200 rounded-md">
        <Text className="font-semibold text-black">Explanations:</Text>
        {explanations.length > 0 ? (
          explanations.map((line, index) => (
            <Text key={index} className="text-sm text-gray-700">
              {line}
            </Text>
          ))
        ) : (
          <Text className="text-sm text-gray-700">
            No explanations available.
          </Text>
        )}
      </View>
    </View>
  );
};

export default CodeRunner;
