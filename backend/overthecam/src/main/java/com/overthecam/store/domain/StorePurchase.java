package com.overthecam.store.domain;

import com.overthecam.auth.domain.User;
import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "store_purchase")
public class StorePurchase extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_purchase_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private StoreItem storeItem;

    /**
     * StorePurchase 엔티티를 생성하는 정적 팩토리 메서드
     *
     * @param userId    구매자 ID
     * @param storeItem 구매할 상품 정보
     * @return 생성된 StorePurchase 엔티티
     */
    /**
     * StorePurchase 엔티티를 생성하는 정적 팩토리 메서드
     *
     * @param user      실제 DB에서 조회한 User 엔티티
     * @param storeItem 구매할 상품 정보
     * @return 생성된 StorePurchase 엔티티
     */
    public static StorePurchase createStorePurchase(User user, StoreItem storeItem) {
        StorePurchase purchase = new StorePurchase();
        purchase.user = user;
        purchase.storeItem = storeItem;
        return purchase;
    }

}
