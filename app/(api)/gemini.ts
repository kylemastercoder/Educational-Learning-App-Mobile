/* eslint-disable prettier/prettier */
import axios from "axios";

const gemini_endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

const instance = axios.create({
  baseURL: gemini_endpoint + "AIzaSyADSIGXyNr6IxnZnE5BWE6SbL55LxJXqmk",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const make_request = async (prompt: string) => {
  try {
    const response = await instance.post("", {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    });
    if (response.data && response.data.candidates.length > 0) {
      const generated_response =
        response.data.candidates[0]?.content?.parts[0]?.text;
      return generated_response || "No content generated.";
    } else {
      console.warn("Invalid response format:", response.data);
      return "Invalid response from API.";
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Gemini API error:", error.message);
    } else {
      console.error("Gemini API error:", error);
    }
    return undefined;
  }
};
