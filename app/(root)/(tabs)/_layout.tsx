import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View
    className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}
  >
    <View
      className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-general-400" : ""}`}
    >
      <Image
        source={source}
        tintColor="white"
        resizeMode="contain"
        className="w-7 h-7"
      />
    </View>
  </View>
);

const Layout = () => {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#333333",
          borderRadius: 50,
          paddingBottom: 0, // ios only
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          height: 78,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.list} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.chat} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
        }}
      />
      {/* hiding the tab bar icon for course and module */}
      <Tabs.Screen
        name="course/[id]"
        options={{
          title: "Course",
          tabBarIconStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="module/[id]"
        options={{
          title: "Module",
          tabBarIconStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="videos/[id]"
        options={{
          title: "Videos",
          tabBarIconStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="quizzes/[id]"
        options={{
          title: "Quizzes",
          tabBarIconStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
      <Tabs.Screen
        name="codes/[id]"
        options={{
          title: "Codes",
          tabBarIconStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
};

export default Layout;
