/* eslint-disable prettier/prettier */
import axios from "axios";

const gemini_endpoint =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";

const instance = axios.create({
  baseURL: gemini_endpoint + "AIzaSyCJL5enZCLRBK-bjEU-eLQ1W4PRMx96xek",
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const make_request = async (prompt: string) => {
  return await instance
    .post("", {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    })
    .then(function (response) {
      const generated_response =
        response.data.candidates[0].content.parts[0].text;
      return generated_response;
    })
    .catch(function (error: any) {
      console.log("gemini error", error);
      return undefined;
    });
};
