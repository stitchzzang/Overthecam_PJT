import { AxiosHeaders } from "axios";
import { authAxios } from "../../common/axiosinstance";

export const getItem = async (setIsLoading) => {
  try {
    const response = await authAxios.get("/store/items/all");
    setIsLoading(false);
    return response;
  } catch (error) {
    console.error("아이템 가져오기 실패", error);
  }
};

export const getMyInventory = async (setIsLoading) => {
  try {
    const response = await authAxios.get("/store/purchases");
    setIsLoading(false);
    return response;
  } catch (error) {
    console.error("내 인벤토리 가져오기 실패", error);
  }
};

export const postPurchase = async (itemId) => {
  try {
    const response = await authAxios.post("/store/purchase", {
      itemId,
    });
    return response;    
  } catch (error) {
    
  }
}
