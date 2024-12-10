/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable prettier/prettier */
import { Href, useRouter } from "expo-router";

export const calculateAge = (birthdate: string) => {
  const [day, month, year] = birthdate.split("/").map(Number);
  if (!day || !month || !year) return "";

  const today = new Date();
  const birthDate = new Date(year, month - 1, day); // Months are 0-based in JavaScript
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Adjust age if the birthdate hasn't occurred yet this year
  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age.toString();
};

export const getInitials = (fullName: string): string => {
  const names = fullName.split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase(); // Single name case
  }
  return names.map((name) => name.charAt(0).toUpperCase()).join("");
};

export const extractVideoId = (url: string) => {
  const regex =
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export function calculatePercentage(
  randomValue: number,
  maxValue: number
): number {
  const percentage = Math.round((randomValue / maxValue) * 100);

  return percentage;
}

export const reloadApp = (path: string) => {
  const router = useRouter();
  router.replace(path as Href);
};
