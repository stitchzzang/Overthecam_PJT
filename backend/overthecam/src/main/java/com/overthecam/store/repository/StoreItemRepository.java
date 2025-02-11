package com.overthecam.store.repository;

import com.overthecam.store.domain.StoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreItemRepository extends JpaRepository<StoreItem, Long> {

    List<StoreItem> findAllByOrderByCreatedAtDesc();

    @Query("SELECT si FROM StoreItem si " +
            "JOIN StorePurchase sp ON si = sp.storeItem " +
            "JOIN sp.user u " +
            "WHERE u.id = :userId " +
            "ORDER BY si.price ASC, sp.createdAt DESC")
    List<StoreItem> findAllUserItems(@Param("userId") Long userId);


}
