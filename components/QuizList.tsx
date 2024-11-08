/* eslint-disable prettier/prettier */
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/config/FirebaseConfig";
import { useRouter } from "expo-router";
import { useGetUser } from "@/hooks/getUser";

interface Question {
  answers: string[]; // Adjusted to be an array of strings for multiple answers
  correctAnswer: string;
  question: string;
}

interface Quizzes {
  id: string;
  difficulties: string;
  howManyQuiz: string;
  type: string;
  thumbnail: string;
  questions: Question[];
}

const QuizList = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = React.useState<Quizzes[]>([]);
  const { userData } = useGetUser();

  React.useEffect(() => {
    const fetchQuizzes = async () => {
      if (!userData?.clerkId) {
        return;
      }

      try {
        // Fetch user's quiz scores
        const scoreQuery = query(
          collection(db, "QuizScore"),
          where("userId", "==", userData.clerkId)
        );
        const scoreSnapshot = await getDocs(scoreQuery);

        const attemptedQuizIds = new Set(
          scoreSnapshot.docs.map((doc) => doc.data().quizId)
        );

        // Fetch quizzes
        const quizQuery = query(
          collection(db, "Quizzes"),
          where("isArchive", "==", false)
        );
        const quizSnapshot = await getDocs(quizQuery);

        if (!quizSnapshot.empty) {
          const quizDocs = await Promise.all(
            quizSnapshot.docs.map(async (doc) => {
              const quizData = doc.data();
              const questions = quizData.questions.map((question: any) => ({
                answers: question.answers.split(", "),
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
          const availableQuizzes = quizDocs.filter((quiz) => {
            return !attemptedQuizIds.has(quiz.id);
          });

          // Check if no quizzes are available
          if (availableQuizzes.length === 0) {
            setQuizzes([]);
          } else {
            setQuizzes(availableQuizzes);
          }
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
      }
    };

    fetchQuizzes();
  }, [userData?.clerkId]);

  const generateRandomColor = () => {
    const colors = [
      "bg-green-700",
      "bg-red-700",
      "bg-blue-700",
      "bg-pink-700",
      "bg-yellow-700",
      "bg-amber-700",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <>
      {quizzes.length === 0 ? (
        <Text>
          All quizzes have been attempted or there is no quiz available! Check
          back later for new quizzes.
        </Text>
      ) : (
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
              <View
                className={`w-full ${generateRandomColor()} h-[150px]`}
              ></View>
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
      )}
    </>
  );
};

export default QuizList;
