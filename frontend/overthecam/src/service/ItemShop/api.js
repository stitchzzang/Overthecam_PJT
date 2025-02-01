import { authAxios } from "../../common/axiosinstance";

export const getItem = async () => {
  const response = await authAxios.get("/store/items/all");
  return response;
};

export const getMyInventory = async () => {
  const response = await authAxios.get("/store/purchases");
  return response;
};
