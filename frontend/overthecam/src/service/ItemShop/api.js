import { authAxios } from "../../common/axiosinstance";

export const getItem = async () => {
  const response = await authAxios.get("/store/items/all");
  return response;
};
