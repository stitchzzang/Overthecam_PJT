import { authAxios } from "../../common/axiosinstance";

export const readRooms = async () => {
  try {
    const response = await authAxios.get('/battle/room/all');
    return response
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error("방 목록 조회 오류", errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};

export const createRoom = async (newTitle) => {
  try {
    const response = await authAxios.post(`/battle/room`, {
      title: newTitle, // POST 요청 본문 (Body)
    });
    console.log(newTitle);
    console.log("세션 id", response.data);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error("세션 생성 오류: ", errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};

export const JoinRoom = async (battleId) => {
  try {
    const response = await authAxios.post(
      `/battle/room/${battleId}/join`,
      {} // 보낼 data 없음
    );
    console.log("세션 id", response);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error("세션 생성 오류: ", errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};
