/* eslint-disable prettier/prettier */
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { useGetUser } from "@/hooks/getUser";
import { getInitials } from "@/lib/utils";
import {
  Image,
  Modal,
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
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React from "react";

const Profile = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false); // State for editing mode
  const [isOpen, setIsOpen] = useState(false);
  const [quizResults, setQuizResults] = useState<
    {
      studentId: any;
      quizId: any;
      quizScore: string;
      correctAnswers: any[];
      studentAnswers: any[];
      timestamp: string;
    }[]
  >([]);

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
    const fetchQuizResults = async () => {
      try {
        // Modify the query to include a where clause
        const quizScoresQuery = query(
          collection(db, "QuizScore"),
          where("userId", "==", userData?.clerkId)
        );
        const quizScoresSnapshot = await getDocs(quizScoresQuery);

        if (!quizScoresSnapshot.empty) {
          const quizScores = quizScoresSnapshot.docs.map((doc) => {
            const data = doc.data();
            console.log("QuizScore Document:", data);
            return {
              studentId: data.userId,
              quizId: data.quizId,
              quizScore: `${data.score}/${data.howManyQuiz}`,
              correctAnswers: data.correctAnswers,
              studentAnswers: data.studentAnswers,
              timestamp: data.timestamp,
            };
          });

          console.log("Fetched Quiz Scores:", quizScores);
          setQuizResults(quizScores);
        } else {
          console.log({
            status: 404,
            message: "No quiz scores found",
          });
        }
      } catch (error) {
        console.error("Error fetching quiz results:", error);
      }
    };

    fetchQuizResults();
  }, [userData?.clerkId]);

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

  if (!userData) return <Text>No User</Text>;

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
        ToastAndroid.SHORT
      );
    }
  };

  const handleEditButtonPress = () => {
    setIsEditing(!isEditing); // Toggle editing mode
  };

  return (
    <>
      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <View className="bg-white rounded-lg p-5 w-4/5">
            <Text className="text-xl font-bold">Quiz Results</Text>
            <View className="mt-2 bg-zinc-100 p-2 flex flex-col items-start justify-start">
              {quizResults.length > 0 ? (
                quizResults.map((result, index) => (
                  <>
                    <Text key={index} className="block text-lg font-bold">
                      Quiz {index + 1}: {result.quizScore}
                    </Text>
                    <View className="flex flex-col">
                      {quizResults.map((result, resultIndex) => (
                        <View key={resultIndex} className="mb-3">
                          {result.correctAnswers.map((correctAnswer, index) => {
                            const studentAnswer = result.studentAnswers[index];
                            const isCorrect = studentAnswer === correctAnswer;

                            return (
                              <View key={index} className="flex flex-col mt-3">
                                <Text className="font-medium">
                                  Question {index + 1}:
                                </Text>
                                <Text className={`ml-2 text-xs`}>
                                  Correct Answer: {correctAnswer}
                                </Text>
                                <Text
                                  className={`ml-2 text-white text-xs mt-1 px-2 py-1 rounded-md ${isCorrect ? "bg-green-500" : "bg-red-500"}`}
                                >
                                  Student Answer:{" "}
                                  {studentAnswer || "No answer provided"}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      ))}
                    </View>
                  </>
                ))
              ) : (
                <Text className="mt-2">No quiz results found</Text>
              )}
            </View>
            <TouchableOpacity
              onPress={() => {
                setIsOpen(false);
              }}
              className="bg-emerald-800 py-2 w-full rounded-lg mt-3"
            >
              <Text className="text-center text-white font-[500]">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
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
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
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
            <TouchableOpacity
              onPress={() => setIsOpen(true)}
              className="items-center p-2 mt-3 w-full rounded-md bg-green-800"
            >
              <Text className="text-white font-bold">View Quiz Score</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

export default Profile;
