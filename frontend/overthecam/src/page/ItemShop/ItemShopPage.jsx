import ItemList from "../../components/ItemShop/ItemList";
import MyInventory from "../../components/ItemShop/MyInventory";

function ItemShopPage() {

  return (
    <>
      <div className="bg-gradient-to-r from-cusPink to-cusLightBlue relative p-20">
        <h1 className="absolute bottom-0 left-6 text-6xl font-extrabold text-white drop-shadow-xl">Store</h1>
      </div>
      <MyInventory/>
      <div>
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
