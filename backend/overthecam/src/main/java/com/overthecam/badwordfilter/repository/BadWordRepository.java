package com.overthecam.badwordfilter.repository;

import com.overthecam.badwordfilter.domain.BadWord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BadWordRepository extends JpaRepository<BadWord, Long> {
    boolean existsByWord(String word);

}
