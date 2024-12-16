/* eslint-disable prettier/prettier */
import MessageIdeas from "@/components/MessageIdeas";
import MessageInput from "@/components/MessageInput";
import { useGetUser } from "@/hooks/getUser";
import { Message, Role } from "@/lib/interfaces";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import ChatMessage from "@/components/ChatMessage";
import { make_request } from "@/app/(api)/gemini";

const CHUNK_DELAY = 100;

const Chat = () => {
  const { userData } = useGetUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [height, setHeight] = useState(0);

  const getCompletions = async (message: string) => {
    console.log(message);
    if (message.length === 0) {
      return;
    }

    // Add the user's message and an empty bot message placeholder
    setMessages((prevMessages) => [
      ...prevMessages,
      { content: message, role: Role.User },
      { role: Role.Bot, content: "" },
    ]);

    try {
      // Start streaming the response from the model
      const generatedResponse = await make_request(message);

      // Simulate chunk-by-chunk response with proper formatting
      const simulateChunks = (text: string) => {
        const chunks = text.split(/(\n)/g); // Split into chunks at new lines
        let index = 0;

        const intervalId = setInterval(() => {
          if (index < chunks.length) {
            setMessages((prevMessages) => {
              const updatedMessages = [...prevMessages];
              const botMessage = updatedMessages[updatedMessages.length - 1];
              botMessage.content += chunks[index];
              return updatedMessages;
            });
            index++;
          } else {
            clearInterval(intervalId); // Stop interval when done
          }
        }, CHUNK_DELAY);
      };

      simulateChunks(generatedResponse || "Sorry, no response.");
    } catch (error) {
      console.error("Error generating response from Gemini: ", error);
    }
  };

  const onLayout = (event: any) => {
    const { height } = event.nativeEvent.layout;
    setHeight(height);
  };

  if (!userData) return <Text>No User</Text>;

  return (
    <SafeAreaView className="flex-1 pb-[110px]">
      <View className="flex-1" onLayout={onLayout}>
        {messages.length === 0 && (
          <View style={{ marginTop: height / 2 - 100 }}>
            <View className="self-center items-center bg-black justify-center p-3 rounded-full">
              <Image
                className="w-12 h-12 object-contain"
                source={require("@/assets/images/logo-white.png")}
              />
            </View>
            <Text className="text-center mt-2 font-semibold">
              Hi, @{userData.username}
            </Text>
          </View>
        )}
        <FlashList
          keyboardDismissMode="on-drag"
          data={messages}
          renderItem={({ item }) => <ChatMessage {...item} />}
          estimatedItemSize={400}
          contentContainerStyle={{ paddingBottom: 150, paddingTop: 30 }}
        />
      </View>
      <KeyboardAvoidingView
        style={{
          position: "absolute",
          bottom: 110,
          left: 0,
          width: "100%",
        }}
        keyboardVerticalOffset={70}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {messages.length === 0 && (
          <MessageIdeas onSelectCard={getCompletions} />
        )}
        <MessageInput onShouldSendMessage={getCompletions} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Chat;
