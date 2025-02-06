import { authAxios } from "../../common/axiosinstance";

export const createRoom = async (newTitle) => {
  try {
    const response = await authAxios.post(
      `/battle/room`,
      {
        title: newTitle, // POST 요청 본문 (Body)
      },
    );
    console.log("세션 id", response.data);
    return data;
  } catch (error) {
    console.error("세션 생성 오류:", error);
    throw error;
  }
};

export const JoinRoom = async (battleId) => {
   try {
     const response = await authAxios.post(
       `/battle/room/${battleId}/join`,
       {} // 보낼 data 없음
     );
     console.log("세션 id", response.data);
     return data;
   } catch (error) {
     console.error("세션 생성 오류:", error);
     throw error;
   }
}
