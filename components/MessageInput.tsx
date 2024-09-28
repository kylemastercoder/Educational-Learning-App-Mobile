/* eslint-disable prettier/prettier */
import { View, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import Plus from "react-native-vector-icons/AntDesign";
import ArrowUpCircle from "react-native-vector-icons/Ionicons";
import Camera from "react-native-vector-icons/Ionicons";
import Attach from "react-native-vector-icons/Ionicons";
import ImagesOutline from "react-native-vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

const ATouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export type MessageInputProps = {
  onShouldSendMessage: (message: string) => void;
};

const MessageInput = ({ onShouldSendMessage }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const { bottom } = useSafeAreaInsets();
  const expanded = useSharedValue(0);

  const expandItems = () => {
    expanded.value = withTiming(1, { duration: 400 });
  };

  const onChangeText = (text: string) => {
    collapseItems();
    setMessage(text);
  };

  const collapseItems = () => {
    expanded.value = withTiming(0, { duration: 400 });
  };

  const onSendMessage = () => {
    onShouldSendMessage(message);
    setMessage("");
  };

  const expandedButtonStyle = useAnimatedStyle(() => {
    const opacityInterpolattion = interpolate(
      expanded.value,
      [0, 1],
      [1, 0],
      Extrapolation.CLAMP
    );
    const widthInterpolation = interpolate(
      expanded.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: opacityInterpolattion,
      width: widthInterpolation,
    };
  });

  const buttonViewStyle = useAnimatedStyle(() => {
    const widthInterpolation = interpolate(
      expanded.value,
      [0, 1],
      [0, 100],
      Extrapolation.CLAMP
    );
    return {
      width: widthInterpolation,
      opacity: expanded.value,
    };
  });

  return (
    <BlurView
      intensity={120}
      tint="extraLight"
      style={{ paddingBottom: bottom, paddingTop: 10 }}
    >
      <View className="flex-row items-center px-2 py-1">
        <ATouchableOpacity
          onPress={expandItems}
          className="w-8 h-8 mr-3 rounded-full items-center justify-center bg-zinc-300"
          style={expandedButtonStyle}
        >
          <Plus name="plus" color="#111" size={20} />
        </ATouchableOpacity>
        <Animated.View
          className="flex-row items-center gap-2"
          style={buttonViewStyle}
        >
          <TouchableOpacity onPress={() => DocumentPicker.getDocumentAsync()}>
            <Attach name="attach" size={25} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => ImagePicker.launchImageLibraryAsync()}
          >
            <ImagesOutline name="images-outline" size={25} color="#111" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => ImagePicker.launchCameraAsync()}>
            <Camera name="camera-outline" size={25} color="#111" />
          </TouchableOpacity>
        </Animated.View>
        <TextInput
          className="flex-1 ml-3 mr-3 border border-zinc-300 rounded-lg py-2 px-3"
          autoFocus
          placeholder="Write your questions..."
          multiline
          value={message}
          onChangeText={onChangeText}
          onFocus={collapseItems}
        />
        {message.length > 0 && (
          <TouchableOpacity onPress={onSendMessage}>
            <ArrowUpCircle
              name="arrow-up-circle-outline"
              size={25}
              color="#111"
            />
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
};

export default MessageInput;
