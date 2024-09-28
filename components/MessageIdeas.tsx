import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import { PredefinedQuestions } from "@/constants";

type Props = {
  onSelectCard: (message: string) => void;
};

const MessageIdeas = ({ onSelectCard }: Props) => {
  return (
    <View>
      <ScrollView
        showsHorizontalScrollIndicator={false}
        horizontal
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 16,
          paddingVertical: 10,
        }}
      >
        {PredefinedQuestions.map((question, index) => (
          <TouchableOpacity
            className="bg-zinc-200 w-[250px] h-[80px] p-3 rounded-md"
            key={index}
            onPress={() =>
              onSelectCard(`${question.title}: ${question.message}`)
            }
          >
            <Text className="font-semibold">{question.title}</Text>
            <Text>{question.message}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default MessageIdeas;
