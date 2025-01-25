package com.overthecam.store.domain;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "store_item")
@Getter
@NoArgsConstructor
public class StoreItem {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeItemId;
    private String name;
    private int price;
    private String detail;
    private String imageUrl;
    private int type;
    private LocalDateTime createdAt;

}
