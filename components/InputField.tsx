import {
  TextInput,
  View,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";

import { InputFieldProps } from "@/types/type";
import { icons } from "@/constants";
import { useState } from "react";

const InputField = ({
  icon,
  secureTextEntry = false,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  onChangeText,
  isLoading,
  isPassword = false,
  ...props
}: InputFieldProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="my-2 w-full">
        <View
          className={`flex flex-row justify-start items-center relative bg-white shadow-lg rounded-md border border-neutral-300 focus:border-emerald-600  ${containerStyle}`}
        >
          {icon && (
            <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
          )}
          <TextInput
            className={`rounded-md py-2 px-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
            secureTextEntry={isPassword && !isPasswordVisible}
            style={{ flexShrink: 0 }}
            onChangeText={onChangeText}
            disableFullscreenUI={isLoading}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              className="mr-2"
            >
              <Image
                source={isPasswordVisible ? icons.eye : icons.eyecross}
                className="w-4 h-4"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default InputField;
