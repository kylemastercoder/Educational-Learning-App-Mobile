import { db } from "@/config/FirebaseConfig";
import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useState, useEffect } from "react";

export const useGetUser = () => {
  const { user } = useUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        setUserData(null); // Explicitly set null if no user
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress || "";
      console.log(email);

      try {
        const q = query(collection(db, "Users"), where("email", "==", email));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDocs = querySnapshot.docs.map((doc) => doc.data());
          setUserData(userDocs[0]);
        } else {
          setUserData(null);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return { userData, loading, error };
};
