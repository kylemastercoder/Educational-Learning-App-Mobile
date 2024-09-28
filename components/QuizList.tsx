/* eslint-disable prettier/prettier */
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser";

interface Question {
  answers: string; // This can be an array of strings if you want to store multiple answers separately
  correctAnswer: string;
  question: string;
}

interface Quizzes {
  id: string;
  difficulties: string;
  howManyQuiz: string;
  type: string;
  thumbnail: string;
  questions: Question[]; // Change this line to reflect that questions is an array of Question
}

const QuizList = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = React.useState<Quizzes[]>([]);
  const { userData } = useGetUser();

  React.useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Fetch user's quiz scores
        const scoreQuery = query(
          collection(db, "QuizScore"),
          where("userId", "==", userData?.clerkId)
        );
        const scoreSnapshot = await getDocs(scoreQuery);

        // Create a set of quiz IDs that the user has attempted
        const attemptedQuizIds = new Set(
          scoreSnapshot.docs.map((doc) => doc.data().quizId)
        );

        // Fetch quizzes
        const quizQuery = query(collection(db, "Quizzes"));
        const quizSnapshot = await getDocs(quizQuery);

        if (!quizSnapshot.empty) {
          const quizDocs = await Promise.all(
            quizSnapshot.docs.map(async (doc) => {
              const quizData = doc.data();
              const questions = quizData.questions.map((question: any) => ({
                answers: question.answers.split(", "), // Convert string to array if needed
                correctAnswer: question.correctAnswer,
                question: question.question,
              }));

              return {
                id: doc.id,
                difficulties: quizData.difficulties,
                howManyQuiz: quizData.howManyQuiz,
                thumbnail: quizData.thumbnail,
                type: quizData.type,
                questions: questions,
              } as Quizzes;
            })
          );

          // Filter quizzes to exclude those already attempted by the user
          const availableQuizzes = quizDocs.filter(
            (quiz) => !attemptedQuizIds.has(quiz.id)
          );

          // Set the filtered quizzes
          setQuizzes(availableQuizzes);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [userData?.clerkId]);

  return (
    <FlatList
      data={quizzes}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => router.push(`/quizzes/${item.id}`)}
          style={{
            backgroundColor: "#fff",
            marginRight: 10,
            borderRadius: 10,
            position: "relative",
          }}
        >
          <Image
            source={{ uri: item.thumbnail }}
            style={{
              width: 210,
              height: 120,
              borderTopRightRadius: 10,
              borderTopLeftRadius: 10,
            }}
          />
          <View className="absolute right-2 top-2 bg-white rounded-md p-1">
            <Text className="capitalize text-xs">{item.difficulties}</Text>
          </View>
          <View style={{ padding: 10 }}>
            <Text style={{ width: 150, fontSize: 14 }}>
              {item.type === "multipleChoice"
                ? "Multiple Choice"
                : "True or False"}
            </Text>
            <Text
              style={{
                marginTop: 3,
                fontSize: 12,
                fontWeight: "bold",
                color: "gray",
              }}
            >
              {item.howManyQuiz} Questions
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

export default QuizList;
