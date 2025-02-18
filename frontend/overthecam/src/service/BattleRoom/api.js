import { authAxios } from "../../common/axiosinstance";

export const readRooms = async () => {
  try {
    const response = await authAxios.get("/battle/room/all");
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("방 목록 조회 오류", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
};

export const createRoom = async (newTitle, userNickname) => {
  try {
    const response = await authAxios.post(`/battle/room`, {
      roomName: newTitle,
      participantName: userNickname, // POST 요청 본문 (Body)
    });
    console.log("세션 id", response);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("세션 생성 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
};

export const joinRoom = async (battleId, userNickname) => {
  try {
    const response = await authAxios.post(
      `/battle/room/${battleId}/join`,
      { participantName: userNickname }
    );
    console.log("세션 id", response);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("세션 생성 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
};

export const leaveRoom = async (battleId) => {
  try{
    const response = await authAxios.delete(`/battle/room/${battleId}/leave`,{})
    console.log("퇴장 성공 여부: ", response.success);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("퇴장 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
}

export const selectbattler = async (
  battleId,
  firstBattlerId,
  secondBattlerId,
  firstOptionId,
  secondOptionId
) => {
  try {
    const response = await authAxios.post(
      `/battle/betting/${battleId}/battler`,
      {
        firstBattlerId,
        secondBattlerId,
        firstOptionId,
        secondOptionId,
      }
    );
    console.log("배틀러 선정 성공, ", response.success);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("배틀러 선정 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
};

export const betSupportScore = async (battleId, optionId, supportScore) => {
  try {
    const response = await authAxios.post(
      `/battle/betting/${battleId}/participant`,
      {
        optionId,
        supportScore,
      }
    );
    console.log("배팅 성공, ", response.success);
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("배팅 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
};

export const sendSTT = async(userId, text) => {
  try {
    const response = await authAxios.post(
      `/report/text`,
      {
        userId,
        text,
      }
    );
    console.log("대화 내용 보내기 성공", response.success)
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;
    const errorStatus = error.error.status;
    console.error("배팅 오류: ", errorStatus, errorCode, errorMessage);
    throw error.error;
  }
}