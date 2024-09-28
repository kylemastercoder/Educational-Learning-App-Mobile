import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { useGetUser } from "@/hooks/getUser";
import { getInitials } from "@/lib/utils";
import {
  Image,
  ScrollView,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/config/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

const Profile = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State for editing mode

  // State for form fields
  const [name, setName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [course, setCourse] = useState("");
  const [block, setBlock] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { userData } = useGetUser();

  useEffect(() => {
    if (userData) {
      setName(userData.name || "");
      setBirthdate(userData.birthdate || "");
      setAge(userData.age || "");
      setGender(userData.gender || "");
      setCourse(userData.course || "");
      setBlock(userData.block || "");
      setStudentNo(userData.studentNo || "");
      setEmail(userData.email || "");
      setUsername(userData.username || "");
      setPassword(userData.password || "");
    }
  }, [userData]);

  if (!userData) return null;

  const handleImagePick = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImageUri = result.assets[0].uri;

        // Create a unique file name based on the current timestamp
        const fileName = Date.now().toString() + ".jpg";

        // Fetch the image as a blob
        const response = await fetch(selectedImageUri);
        const blob = await response.blob();

        // Create a reference to the Firebase Storage location
        const imageRef = ref(storage, `profile/${fileName}`);

        // Upload the image blob to Firebase Storage
        const snapshot = await uploadBytes(imageRef, blob);

        // Get the download URL for the uploaded image
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update the image state
        setImage(downloadURL);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!userData) return;

      const userRef = doc(db, "Users", userData.clerkId);

      // Update the user profile in Firestore
      await updateDoc(userRef, {
        name,
        birthdate,
        age,
        gender,
        course,
        block,
        studentNo,
        email,
        username,
        password,
      });

      ToastAndroid.show("Profile updated successfully!", ToastAndroid.SHORT);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      ToastAndroid.show(
        "Error updating profile. Please try again.",
        ToastAndroid.SHORT,
      );
    }
  };

  const handleEditButtonPress = () => {
    setIsEditing(!isEditing); // Toggle editing mode
  };

  return (
    <SafeAreaView className="flex-1 bg-white h-screen">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">My Profile</Text>
        <View className="flex items-center justify-center relative my-5">
          {image ? (
            <>
              <Image
                source={{ uri: image }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                className="rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
              />
              <TouchableOpacity
                className="absolute bottom-0 z-10 right-[110px] bg-white rounded-full p-2"
                style={{ elevation: 3 }}
                onPress={handleImagePick}
              >
                <Image
                  source={icons.edit}
                  resizeMode="contain"
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </>
          ) : userData.profile ? (
            <>
              <Image
                source={{ uri: userData.profile }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
                className="rounded-full border-[3px] border-white shadow-sm shadow-neutral-300"
              />
              <TouchableOpacity
                className="absolute bottom-0 z-10 right-[110px] bg-white rounded-full p-2"
                style={{ elevation: 3 }}
                onPress={handleImagePick}
              >
                <Image
                  source={icons.edit}
                  resizeMode="contain"
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View className="rounded-full relative m-auto h-[100px] item-center justify-center w-[100px] p-5 border bg-zinc-100 border-zinc-300">
                <Text className="text-center font-bold text-2xl">
                  {getInitials(name)}
                </Text>
              </View>
              <TouchableOpacity
                className="absolute bottom-0 right-[110px] bg-white rounded-full p-2"
                style={{ elevation: 3, marginLeft: 20 }}
                onPress={handleImagePick}
              >
                <Image
                  source={icons.edit}
                  resizeMode="contain"
                  className="w-4 h-4"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              value={name}
              placeholder={"Name"}
              containerStyle="w-full"
              inputStyle="py-1.5 px-3"
              editable={isEditing}
              onChangeText={setName}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField
                  value={birthdate}
                  placeholder={"Birthdate"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setBirthdate}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  value={age}
                  placeholder={"Age"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setAge}
                />
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField
                  value={gender}
                  placeholder={"Gender"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setGender}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  value={course}
                  placeholder={"Course"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setCourse}
                />
              </View>
            </View>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <View style={{ flex: 1, marginRight: 10 }}>
                <InputField
                  value={block}
                  placeholder={"Block"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setBlock}
                />
              </View>
              <View style={{ flex: 1 }}>
                <InputField
                  value={studentNo}
                  placeholder={"Student No"}
                  containerStyle="w-full"
                  inputStyle="py-1.5 px-3"
                  editable={isEditing}
                  onChangeText={setStudentNo}
                />
              </View>
            </View>
            <InputField
              value={email}
              placeholder={"Email"}
              containerStyle="w-full"
              inputStyle="py-1.5 px-3"
              editable={isEditing}
              onChangeText={setEmail}
            />
            <InputField
              value={username}
              placeholder={"Username"}
              containerStyle="w-full"
              inputStyle="py-1.5 px-3"
              editable={isEditing}
              onChangeText={setUsername}
            />
            <InputField
              value={password}
              placeholder={"Password"}
              containerStyle="w-full"
              inputStyle="py-1.5 px-3"
              editable={isEditing}
              isPassword
              onChangeText={setPassword}
            />
          </View>
          <TouchableOpacity
            onPress={isEditing ? handleSaveChanges : handleEditButtonPress} // Save or edit based on mode
            className="items-center p-2 mt-3 w-full rounded-md bg-general-400"
          >
            <Text className="text-white font-bold">
              {isEditing ? "Save Profile" : "Edit Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
