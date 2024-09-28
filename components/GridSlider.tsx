import {
  View,
  Text,
  FlatList,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRouter, Link } from "expo-router";

type GridSliderProps = {
  data: { id: string; name: string; imageUrl: string; moduleCount: number }[];
};

const GridSlider = ({ data }: GridSliderProps) => {
  const router = useRouter();
  const { width } = Dimensions.get("window");
  const itemWidth = width / 1 - 0;
  const renderItem = ({
    item,
  }: {
    item: { id: string; name: string; imageUrl: string; moduleCount: number };
  }) => (
    <Link href={`/course/${item.id}`} asChild>
      <TouchableOpacity
        style={{ width: itemWidth }}
        className="mr-2 mt-2 h-40 bg-general-400 rounded-md"
      >
        <Image
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-[100px] object-cover"
        />
        <Text className="text-white text-[16px] mx-4 font-semibold mt-1.5">
          {item.name}
        </Text>
        <Text className="text-white text-sm mx-4">
          {item.moduleCount} modules
        </Text>
      </TouchableOpacity>
    </Link>
  );
  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
    />
  );
};

export default GridSlider;
