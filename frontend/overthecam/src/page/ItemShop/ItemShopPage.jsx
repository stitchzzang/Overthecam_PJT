import ItemList from "../../components/ItemShop/ItemList";
import MyInventory from "../../components/ItemShop/MyInventory";

function ItemShopPage() {

  return (
    <>
      <div>
        <h1>상점 페이지: Store</h1>
      </div>
      <MyInventory/>
      <div>
        <h3>내 인벤토리</h3>
      </div>
      <div>
        <h3>상품 목록</h3>
        <div>
            <ItemList/>
        </div>
      </div>
    </>
  );
}

export default ItemShopPage;
