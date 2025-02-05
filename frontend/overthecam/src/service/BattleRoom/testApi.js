import { authAxios } from "../../common/axiosinstance";
import axios from "axios";

const APPLICATION_SERVER_URL = import.meta.env.VITE_OPENVIDU_URL;
const accessToken = "";
const newTitle = "test";
// 세션 생성
export const createSession = async () => {
  try {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/chat/battle/room`,
      {
        headers: {
          // "Content-Type": "application/json",
          Authorization: accessToken,
        },
        data: {
          title: newTitle,
        },
      }
    );
    console.log("세션 id", response.data);
    return response.data;
  } catch (error) {
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

export const getToken = async () => {
  try {
    const response = await createSession();
    return await response.data.connectionToken;
  } catch (error) {
    console.error("토큰 획득 오류:", error);
    throw error;
  }
};
