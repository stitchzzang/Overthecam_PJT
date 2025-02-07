package com.overthecam.store.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.store.domain.StorePurchase;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StorePurchaseRepository extends JpaRepository<StorePurchase, Long> {

    boolean existsByUserIdAndStoreItemId(Long userId, Long storeItemId);

    Long user(User user);
}
