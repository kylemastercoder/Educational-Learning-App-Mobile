import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Clipboard,
  ToastAndroid,
} from "react-native";
import React, { useState } from "react";
import { Message, Role } from "@/lib/interfaces";
import { useGetUser } from "@/hooks/getUser";

const ChatMessage = ({ content, role, imageUrl, prompt }: Message) => {
  const { userData } = useGetUser();
  const [showCopyButton, setShowCopyButton] = useState(false);

  const handlePress = () => {
    setShowCopyButton(true);
  };

  const handleCopy = () => {
    Clipboard.setString(content);
    setShowCopyButton(false);
    ToastAndroid.show("Copied!", ToastAndroid.CENTER);
  };

  if (!userData) return null;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-start",
        paddingHorizontal: 14,
        gap: 8,
        marginVertical: 8,
      }}
    >
      {role === Role.Bot ? (
        <View className="items-center bg-black justify-center p-2 rounded-full">
          <Image
            className="w-6 h-6 object-contain"
            source={require("@/assets/images/logo-white.png")}
          />
        </View>
      ) : (
        <Image
          source={{ uri: userData.profile }}
          className="w-10 h-10 rounded-full"
        />
      )}
      <TouchableOpacity onPress={handlePress} className="pr-10">
        <Text className="p-2 flex-wrap">{content}</Text>
        {showCopyButton && (
          <TouchableOpacity
            className="bg-zinc-200 items-center rounded-lg p-2 w-16"
            onPress={handleCopy}
          >
            <Text>Copy</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChatMessage;
