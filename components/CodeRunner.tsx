/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
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

const CodeRunner = ({
  correctOutput,
  programmingLanguage,
}: {
  correctOutput: string;
  programmingLanguage: string;
}) => {
  const getBoilerplateCode = (language: string) => {
    switch (language.trim().toLowerCase()) {
      case "c":
      case "c language":
        return `
#include <stdio.h>

int main() {
    // Your code here
    return 0;
}
      `;
      case "c++":
      case "c++ language":
        return `
#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}
      `;
      case "c#":
      case "c# language":
        return `
using System;

class Program {
    static void Main() {
        // Your code here
    }
}
      `;
      default:
        return "// Unsupported language";
    }
  };

  const getScriptLanguage = (language: string) => {
    switch (language.trim().toLowerCase()) {
      case "c":
      case "c language":
        return "c";
      case "c++":
      case "c++ language":
        return "cpp";
      case "c#":
      case "c# language":
        return "csharp";
      default:
        return "unknown";
    }
  };

  const [code, setCode] = useState(getBoilerplateCode(programmingLanguage));
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
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    // Update the boilerplate code whenever the programming language changes
    const updatedBoilerplate = getBoilerplateCode(programmingLanguage);
    setCode(updatedBoilerplate);
  }, [programmingLanguage]);

  const runCode = async () => {
    const clientId = "d5a599f5ed21dbf2a279d51e40054d22";
    const clientSecret =
      "2b2e62db3d285fe943c76e43acaa56ff9eebfc5e4318b87d410635742dc882da";
    const scriptLanguage = getScriptLanguage(programmingLanguage);
    const program = {
      script: code,
      language: scriptLanguage,
      versionIndex: "0",
      clientId,
      clientSecret,
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

  const fetchExplanations = async (code: string) => {
    try {
      const explanation = await make_request(code);
      if (explanation) {
        setExplanations(explanation.split("\n"));
      } else {
        setExplanations(["No explanations available."]);
      }
    } catch (error) {
      setExplanations(["Error fetching explanations"]);
    }
  };

  const handleCodeChange = (text: string) => {
    setCode(text.endsWith("\n") ? text + "    " : text);
  };

  return (
    <View>
      <Text className="text-lg font-semibold">Write Your Code Here:</Text>
      <Text className="mb-3">Programming Language: {programmingLanguage}</Text>
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
      <View className="mt-5 p-3 bg-gray-200 rounded-md">
        <Text className="font-semibold text-black">Output:</Text>
        <Text className="text-sm text-gray-700">{output || "No output"}</Text>
      </View>
    </View>
  );
};

export default CodeRunner;
