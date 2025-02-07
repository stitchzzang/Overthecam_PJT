package com.overthecam.store.domain;


import com.overthecam.common.entity.TimeStampEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "store_item")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StoreItem extends TimeStampEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_item_id")
    private Long id;

    private String name;
    private int price;
    private String detail;
    private String imageUrl;

    @Enumerated(EnumType.ORDINAL)  // DB에는 숫자로 저장
    private ItemType type;

}
