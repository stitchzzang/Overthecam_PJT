import axios from "axios";

const APPLICATION_SERVER_URL =
  process.env.NODE_ENV === "production" ? "" : "http://localhost:5000/";

export const createSession = async (sessionId) => {
    try {
      const response = await axios.post(
        `${APPLICATION_SERVER_URL}api/sessions`,
        { customSessionId: sessionId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      return response.data;
    } catch (error) {
      console.error("세션 생성 오류:", error);
      throw error;
    }
  };

export const createToken = async (sessionId) => {
  try {
    const response = await axios.post(
      `${APPLICATION_SERVER_URL}api/sessions/${sessionId}/connections`,
      {},
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("토큰 생성 오류:", error);
    throw error;
  }
};

export const getToken = async (sessionId) => {
  try {
    const newSessionId = await createSession(sessionId);
    return await createToken(newSessionId);
  } catch (error) {
    console.error("토큰 획득 오류:", error);
    throw error;
  }
};