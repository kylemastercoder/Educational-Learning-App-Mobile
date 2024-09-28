import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { calculateAge } from "@/lib/utils";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { Picker } from "@react-native-picker/picker";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    birthdate: "",
    age: "",
    gender: "",
    block: "",
    studentNo: "",
    course: "Bachelor of Science in Information Technology",
    username: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const handleBirthdateChange = (value: string) => {
    // Remove non-digit characters
    const cleaned = value.replace(/\D/g, "");

    // Extract day, month, year
    let day = cleaned.slice(0, 2);
    let month = cleaned.slice(2, 4);
    let year = cleaned.slice(4, 8);

    // Limit day to 31
    if (parseInt(day) > 31) {
      day = "31";
    }

    // Limit month to 12
    if (parseInt(month) > 12) {
      month = "12";
    }

    // Combine day, month, year
    let formatted = day;
    if (month) formatted += `/${month}`;
    if (year) formatted += `/${year}`;

    // Calculate age
    const age = calculateAge(formatted);

    // Update the form state
    setForm((prev) => ({
      ...prev,
      birthdate: formatted,
      age: age,
    }));
  };

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({ ...verification, state: "pending" });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0]?.longMessage || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (
        completeSignUp.status === "complete" &&
        completeSignUp.createdUserId
      ) {
        // passing to the backend
        const userRef = doc(db, "Users", completeSignUp.createdUserId);
        await setDoc(userRef, {
          name: form.name,
          email: form.email,
          birthdate: form.birthdate,
          age: form.age,
          block: form.block,
          course: form.course,
          studentNo: form.studentNo,
          username: form.username,
          password: form.password,
          gender: form.gender,
          clerkId: completeSignUp.createdUserId,
          profile: "",
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({ ...verification, state: "success" });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0]?.longMessage || "An error occurred.",
        state: "failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white h-full">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpBg} className="z-0 w-full h-[250px]" />
          <Text className="text-lg text-black font-JakartaSemiBold absolute bottom-8 left-5">
            Join Us!
          </Text>
          <Text className="text-sm font-JakartaMedium absolute bottom-3 left-5">
            Create a C-Challenge account to get started.
          </Text>
        </View>
        <View className="py-3 px-5">
          <InputField
            placeholder="Enter your name"
            value={form.name}
            onChangeText={(value) => setForm({ ...form, name: value })}
            isLoading={isLoading}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 10 }}>
              <InputField
                placeholder="dd/mm/yyyy"
                value={form.birthdate}
                onChangeText={handleBirthdateChange}
                isLoading={isLoading}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                placeholder="Enter your age"
                value={form.age}
                onChangeText={(value) => setForm({ ...form, age: value })}
                isLoading={isLoading}
              />
            </View>
          </View>
          <View style={{ flex: 1, marginRight: 10 }}>
            <View className="border border-zinc-300 rounded-md w-[320px] py-0">
              <Picker
                selectedValue={form.gender}
                onValueChange={(itemValue, itemIndex) =>
                  setForm({ ...form, gender: itemValue })
                }
                itemStyle={{ fontSize: 15 }}
                style={{ padding: 0 }}
              >
                <Picker.Item color="gray" label="Select Your Gender" value="" />
                <Picker.Item color="gray" label="Male" value="Male" />
                <Picker.Item color="gray" label="Female" value="Female" />
                <Picker.Item
                  color="gray"
                  label="Prefer Not To say"
                  value="Prefer Not To say"
                />
              </Picker>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <InputField
              placeholder="Enter Course"
              readOnly
              value={form.course}
              onChangeText={(value) => setForm({ ...form, course: value })}
              isLoading={isLoading}
            />
          </View>
          <View className="border border-zinc-300 rounded-md w-[320px] py-0">
            <Picker
              selectedValue={form.block}
              onValueChange={(itemValue, itemIndex) =>
                setForm({ ...form, block: itemValue })
              }
              itemStyle={{ fontSize: 15 }}
              style={{ padding: 0 }}
            >
              <Picker.Item color="gray" label="Select Your Block" value="" />
              <Picker.Item color="gray" label="A" value="A" />
              <Picker.Item color="gray" label="B" value="B" />
              <Picker.Item color="gray" label="C" value="C" />
              <Picker.Item color="gray" label="D" value="D" />
              <Picker.Item color="gray" label="E" value="E" />
            </Picker>
          </View>
          <InputField
            placeholder="Student No. (e.g. ***-***)"
            value={form.studentNo}
            onChangeText={(value) => setForm({ ...form, studentNo: value })}
            isLoading={isLoading}
          />
          <InputField
            placeholder="Enter email"
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) => setForm({ ...form, email: value })}
            isLoading={isLoading}
          />
          <InputField
            placeholder="Enter Username"
            value={form.username}
            onChangeText={(value) => setForm({ ...form, username: value })}
            isLoading={isLoading}
          />
          <InputField
            placeholder="Enter Password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
            isLoading={isLoading}
            isPassword
          />
          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
            disabled={isLoading}
          />
          <OAuth />
          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-emerald-600">Log In</Text>
          </Link>
        </View>
      </View>

      {/* Verification Modal */}
      <ReactNativeModal
        isVisible={verification.state === "pending"}
        // onBackdropPress={() =>
        //   setVerification({ ...verification, state: "default" })
        // }
        onModalHide={() => {
          if (verification.state === "success") {
            setShowSuccessModal(true);
          }
        }}
      >
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Text className="font-JakartaExtraBold text-2xl mb-2">
            Verification
          </Text>
          <Text className="font-Jakarta mb-5">
            We've sent a verification code to {form.email}.
          </Text>
          <InputField
            icon={icons.lock}
            placeholder={"12345"}
            value={verification.code}
            keyboardType="numeric"
            onChangeText={(code) => setVerification({ ...verification, code })}
          />
          {verification.error && (
            <Text className="text-red-500 text-sm mt-1">
              {verification.error}
            </Text>
          )}
          <CustomButton
            title="Verify Email"
            onPress={onPressVerify}
            className="mt-5 bg-success-500"
          />
        </View>
      </ReactNativeModal>

      {/* Success Modal */}
      <ReactNativeModal isVisible={showSuccessModal}>
        <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
          <Image
            source={images.check}
            className="w-[110px] h-[110px] mx-auto my-5"
          />
          <Text className="text-3xl font-JakartaBold text-center">
            Verified
          </Text>
          <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
            You have successfully verified your account.
          </Text>
          <CustomButton
            title="Browse Home"
            onPress={() => router.push(`/(root)/(tabs)/home`)}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </ScrollView>
  );
};

export default SignUp;
