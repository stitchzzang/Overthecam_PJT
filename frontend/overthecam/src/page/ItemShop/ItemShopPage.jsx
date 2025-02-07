import ItemList from "../../components/ItemShop/ItemList";
import MyInventory from "../../components/ItemShop/MyInventory";

function ItemShopPage() {

  return (
    <>
      <div className="relative p-10">
        <h1 className="absolute left-10 text-4xl font-extrabold text-white drop-shadow-xl">Store</h1>
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
