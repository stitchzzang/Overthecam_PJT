import { authAxios } from "../../common/axiosinstance";

export const getItem = async () => {
  try {
    const response = await authAxios.get("/store/item/all");
    console.log("상점 데이터:", response.data);
    return response.data;
  } catch (error) {
    // error.error 객체 안에 실제 에러 정보가 있음
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error(errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};

export const getMyInventory = async () => {
  try {
    const response = await authAxios.get("/store/item/my/all");
    return response;
  } catch (error) {
    // error.error 객체 안에 실제 에러 정보가 있음
    const errorMessage = error.error.message;  // "구매한 상품이 없습니다."
    const errorCode = error.error.code;        // "STORE_ITEM_NOT_FOUND"
    const errorStatus = error.error.status;    // 404
    
    console.error(errorStatus ,errorCode, errorMessage);
    throw error.error; // 또는 throw { message: errorMessage };
  }
};

export const postPurchase = async (storeItemId) => {
  try {
    const response = await authAxios.post(
      `/store/item/${storeItemId}/purchase`,
      {}
    );
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error(errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};

export const postExchangePoints = async (score) => {
  try {
    const response = await authAxios.post(`/mypage/revert?supportScore=${score}`, {})
    return response;
  } catch (error) {
    const errorMessage = error.error.message;
    const errorCode = error.error.code;  
    const errorStatus = error.error.status;
    console.error(errorStatus ,errorCode, errorMessage);
    throw error.error;
  }
};

// // 아이템 구매 API
// export const purchaseItem = async (storeItemId) => {
//   try {
//     const response = await authAxios.post(`/store/item/${storeItemId}/purchase`);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// };
