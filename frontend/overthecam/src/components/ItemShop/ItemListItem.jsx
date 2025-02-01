function ItemListItem({ itemInfo }) {
    const onPurchase = ()=>{
        // 모달 띄우기
        // 모달 확인 시
        // 구매 axios 함수
    }
  return (
    <>
      <h5>{itemInfo.name}</h5>
      <img src={itemInfo.imageURL} alt=""/>
      <p>{itemInfo.detail}</p>
      <div>
        <button onClick={onPurchase}>{itemInfo.price}</button>
      </div>
    </>
  );
}

export default ItemListItem;