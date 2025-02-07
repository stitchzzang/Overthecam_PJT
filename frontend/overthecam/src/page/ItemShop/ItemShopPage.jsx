import ItemList from "../../components/ItemShop/ItemList";
import MyInventory from "../../components/ItemShop/MyInventory";

function ItemShopPage() {

  return (
    <>
      <div className="flex justify-start bg-gradient-to-r from-cusPink to-cusLightBlue pt-6 pl-6">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-xl">
          아이템 상점
        </h1>
      </div>
      <MyInventory />
      <div></div>
      <div>
        <h3>상품 목록</h3>
        <div>
          <ItemList />
        </div>
      </div>
    </>
  );
}

export default ItemShopPage;
