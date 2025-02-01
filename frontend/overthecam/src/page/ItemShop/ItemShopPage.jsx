import axios, { Axios } from "axios";
import { useEffect, useState } from "react";
import { getItem } from "../../service/ItemShop/api";

function ItemShopPage() {
    const BASE_URL = ""
  const [Items, setItems] = useState([[
    {
      name: "기본프레임",
      price: 200,
      detail: "프레임 입니다",
      imageUrl: "",
      type: 0
    }
  ]]);

  useEffect(()=>{
    // axios 요청
    getItem();
    
  },[])

  return (
    <>
      <div>
        <h1>상점 페이지: Store</h1>
      </div>
      <div></div>
    </>
  );
}

export default ItemShopPage;
