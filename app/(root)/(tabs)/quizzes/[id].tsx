/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  ActivityIndicator,
  ToastAndroid,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Stack, Tabs, useLocalSearchParams, useRouter } from "expo-router";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import ArrowLeft from "react-native-vector-icons/AntDesign";
import { useGetUser } from "@/hooks/getUser";
import LottieView from "lottie-react-native";
import { animations } from "@/constants";
import ConfettiCannon from "react-native-confetti-cannon";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";

interface Question {
  answers: string[]; // Change this to an array of strings
  correctAnswer: string;
  question: string;
}

interface Quizzes {
  id: string;
  difficulties: string;
  userId: string;
  howManyQuiz: string;
  type: string;
  thumbnail: string;
  questions: Question[]; // Change this line to reflect that questions is an array of Question
}

const SpecificQuiz = () => {
  const { id } = useLocalSearchParams();
  const { userData } = useGetUser();
  const router = useRouter();
  const [quizData, setQuizData] = useState<Quizzes | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(60);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [introduction, setIntroduction] = useState(true);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [isChoicesDisabled, setIsChoicesDisabled] = useState(false);

  useEffect(() => {
    const fetchQuizData = async () => {
      if (!id) return;

      try {
        const quizQuery = query(collection(db, "Quizzes"));
        const quizSnapshot = await getDocs(quizQuery);

        if (!quizSnapshot.empty) {
          const quizDocs = await Promise.all(
            quizSnapshot.docs.map(async (doc) => {
              const quizData = doc.data();
              const questions = quizData.questions.map((question: any) => ({
                answers: Array.isArray(question.answers)
                  ? question.answers
                  : question.answers.split(", "),
                correctAnswer: question.correctAnswer,
                question: question.question,
              }));

              return {
                id: doc.id,
                difficulties: quizData.difficulties,
                howManyQuiz: quizData.howManyQuiz,
                thumbnail: quizData.thumbnail,
                userId: quizData.userId,
                type: quizData.type,
                questions: questions,
              } as Quizzes;
            })
          );
          const specificQuiz = quizDocs.find((quiz) => quiz.id === id);
          setQuizData(specificQuiz || null);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, [id]);

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quizData!.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setIsAnswerSelected(false);
      setIsChoicesDisabled(false);
    } else {
      saveScoreToFirebase(); // Save score before showing the modal
      setModalVisible(true); // Show modal only when the quiz is completed
    }
  };

  const saveScoreToFirebase = async () => {
    const quizScoreData = {
      quizId: id,
      userId: userData?.clerkId,
      score: score,
      howManyQuiz: quizData?.howManyQuiz,
      timestamp: new Date().toISOString(),
    };
    try {
      await addDoc(collection(db, "QuizScore"), quizScoreData);
      console.log("Score saved to Firebase:", quizScoreData);
    } catch (error) {
      console.error("Error saving score to Firebase:", error);
    }
  };

  useEffect(() => {
    if (
      quizData &&
      quizData.questions &&
      currentQuestionIndex >= quizData.questions.length
    ) {
      setModalVisible(true);
    }
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (quizData && currentQuestionIndex < quizData.questions.length) {
      setTimer(60);
      const countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            goToNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (
    questionIndex: number,
    selectedAnswer: string,
    correctAnswer: string
  ) => {
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = selectedAnswer;
    setSelectedAnswers(newSelectedAnswers);
    setIsAnswerSelected(true);
    setIsChoicesDisabled(true);

    // Check if the selected answer is correct
    if (selectedAnswer === correctAnswer) {
      setScore((prev) => prev + 1);
      ToastAndroid.show("You selected the right answer.", ToastAndroid.SHORT);
    } else {
      ToastAndroid.show(
        "Sorry, that is not the right answer.",
        ToastAndroid.SHORT
      );
    }

    // Wait for 5 seconds before going to the next question
    setTimeout(goToNextQuestion, 5000);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    ToastAndroid.show(error, ToastAndroid.SHORT);
  }

  return (
    <>
      {introduction ? (
        <>
          <Tabs.Screen
            options={{
              tabBarStyle: { display: "none" },
              tabBarIcon: () => null,
            }}
          />
          <Stack.Screen
            options={{
              headerShown: false,
            }}
          />
          <View className="items-center justify-center mt-32 p-5">
            <LottieView
              source={animations.quiz}
              autoPlay
              loop
              style={{ width: "100%", height: 300 }}
            />
            <Text className="text-center text-lg font-semibold">
              Welcome to the C Programming Quiz!
            </Text>
            <Text className="text-center">
              We’re excited to have you here! This quiz is designed to challenge
              your knowledge and skills in C programming. You have four choices
              to select from, and you have 60 seconds to answer each question.
              Good luck!
            </Text>
            <TouchableOpacity
              className="bg-emerald-800 rounded-lg mt-5 py-2 w-full"
              onPress={() => setIntroduction(false)}
            >
              <Text className="text-center text-white font-semibold text-[18px]">
                Get Started
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <Tabs.Screen
            options={{
              tabBarStyle: { display: "none" },
              tabBarIcon: () => null,
            }}
          />
          <Stack.Screen
            options={{
              headerTitle: "Quiz Details",
              headerTintColor: "#111",
              headerLeft: () => (
                <TouchableOpacity
                  className="ml-5"
                  onPress={() => router.back()}
                >
                  <ArrowLeft name="arrowleft" size={20} color="#111" />
                </TouchableOpacity>
              ),
            }}
          />
          <ScrollView className="p-5">
            <View className="pb-20">
              <View className="mt-5">
                {quizData?.questions && quizData.questions.length > 0 && (
                  <View className="mt-2 px-1">
                    <Text className="text-center font-[500] mt-3">
                      {currentQuestionIndex + 1}/{quizData.questions.length}
                    </Text>
                    <View
                      className="bg-white justify-center mb-5 items-center w-full"
                      style={{
                        height: 180,
                        borderRadius: 20,
                        marginTop: 50,
                        elevation: 5,
                        padding: 16,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.4,
                        shadowRadius: 5,
                      }}
                    >
                      <View
                        style={{
                          marginTop: -100,
                          marginBottom: 50,
                          backgroundColor: "#fff",
                          borderRadius: 50,
                        }}
                      >
                        <CountdownCircleTimer
                          isPlaying
                          key={currentQuestionIndex}
                          duration={60}
                          colors={["#006400", "#A30000"]}
                          size={80}
                          colorsTime={[60, 10]}
                          onComplete={() => {
                            return { shouldRepeat: true, delay: 5 };
                          }}
                        >
                          {({ remainingTime }) => <Text>{timer}</Text>}
                        </CountdownCircleTimer>
                      </View>
                      <Text className="font-[500] text-center text-[14px]">
                        {quizData.questions[currentQuestionIndex].question}
                      </Text>
                    </View>
                    <View className="w-full mt-3">
                      {quizData.questions[currentQuestionIndex].answers.map(
                        (answer, index) => {
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                handleAnswerSelect(
                                  currentQuestionIndex,
                                  answer,
                                  quizData.questions[currentQuestionIndex]
                                    .correctAnswer
                                )
                              }
                              disabled={isChoicesDisabled}
                              className={`bg-white rounded-lg my-2 p-2 border-2 border-gray-300 ${
                                isAnswerSelected
                                  ? answer ===
                                    quizData.questions[currentQuestionIndex]
                                      .correctAnswer
                                    ? "border-green-500"
                                    : "border-red-500"
                                  : ""
                              }`}
                            >
                              <Text className="text-center text-[14px]">
                                {answer}
                              </Text>
                            </TouchableOpacity>
                          );
                        }
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
        </>
      )}

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/80">
          <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} />
          <View className="bg-white rounded-lg p-5 w-4/5">
            <Text className="text-xl font-bold">Quiz Completed!</Text>
            <Text className="mt-2 text-lg font-[500]">
              Your Score: {score}/{quizData?.questions.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.back(); // Navigate back after closing the modal
              }}
              className="bg-emerald-800 py-2 w-full rounded-lg mt-3"
            >
              <Text className="text-center text-white font-[500]">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default SpecificQuiz;
