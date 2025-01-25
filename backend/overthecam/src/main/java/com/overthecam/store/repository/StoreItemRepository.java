package com.overthecam.store.repository;

import com.overthecam.store.domain.StoreItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreItemRepository extends JpaRepository<StoreItem, Long> {

   List<StoreItem> findAll();

}
