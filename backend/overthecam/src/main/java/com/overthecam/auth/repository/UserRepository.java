package com.overthecam.auth.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.auth.dto.UserScoreDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    // 특정 유저의 응원점수와 포인트 조회
    @Query("SELECT new com.overthecam.auth.dto.UserScoreDto(u.supportScore, u.point) FROM User u WHERE u.id = :userId")
    Optional<UserScoreDto> findScoreAndPointByUserId(Long userId);

    // 응원점수 업데이트
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.supportScore = :score WHERE u.id = :userId")
    void updateSupportScore(@Param("userId") Long userId, @Param("score") Integer score);

    // 포인트 업데이트
    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.point = :point WHERE u.id = :userId")
    void updatePoint(@Param("userId") Long userId, @Param("point") Integer point);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.supportScore = :supportScore, u.point = :point WHERE u.id = :userId")
    void updateScoreAndPoint(@Param("userId") Long userId,
                             @Param("supportScore") int supportScore,
                             @Param("point") int point);
}
