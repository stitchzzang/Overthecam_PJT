import { authAxios } from "../../common/axiosinstance";

export const getItem = async () => {
  try {
    const response = await authAxios.get("/store/item/all");
    return response;
  } catch (error) {
    console.error("아이템 가져오기 실패", error);
  }
};

export const getMyInventory = async () => {
  try {
    const response = await authAxios.get("/store/item/my/all");
    return response;
  } catch (error) {
    console.error("내 인벤토리 가져오기 실패", error);
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
    console.error("구매 실패", error);
  }
};

export const postExchangePoints = async (score) => {
  try {
    // const response = await authAxios.post("/points/convert ", {
    //   score,
    // })
    // return response;
  } catch (error) {
    console.error("환전 실패", error);
  }
};
