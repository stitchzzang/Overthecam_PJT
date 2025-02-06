import { authAxios } from "../../common/axiosinstance";
import axios from "axios";

const APPLICATION_SERVER_URL = import.meta.env.VITE_OPENVIDU_URL;
const accessToken = import.meta.env.VITE_TOKEN;
const newTitle = "test";
// 세션 생성
export const createSession = async (battleId) => {
  try {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/battle/room/${battleId}/join`,
      {},
      {
        title: newTitle, // POST 요청 본문 (Body)
      },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InRlc3QxQGdtYWlsLmNvbSIsIm5pY2tuYW1lIjoi7YWM7Iqk7YSwMSIsInVzZXJJZCI6MSwiaWF0IjoxNzM4ODE5ODU0LCJleHAiOjE3Mzg4MjE2NTR9.BXW2WxPy8IW4v3qMaxPI8csOOzx6gPM8elfxoypFQR0`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("세션 id", response.data);
    return response.data;
  } catch (error) {
    console.log(accessToken)
    console.error("세션 생성 오류:", error);
    throw error;
  }

};

// export const createToken = async (sessionId) => {
//   try {
//     const response = await axios.post(
//       `${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`,
//       {},
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );
//     const token = response.data;
//     console.log("토큰 이렇게 생김", token);
//     return token;
//   } catch (error) {
//     console.error("토큰 생성 오류:", error);
//     throw error;
//   }
// };

export const getToken = async (battleId) => {
  try {
    const response = await createSession(battleId);
    return await response.data.connectionToken;
  } catch (error) {
    console.error("토큰 획득 오류:", error);
    throw error;
  }
};
