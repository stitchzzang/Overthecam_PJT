package com.overthecam.auth.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.member.dto.UserScoreInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
    Optional<User> findByUsernameAndPhoneNumberAndBirth(String username, String phoneNumber, LocalDate birth);
    Optional<User> findByEmailAndUsernameAndPhoneNumber(String email, String username, String phoneNumber);

    // 특정 유저의 응원점수와 포인트 조회
    @Query("SELECT new com.overthecam.member.dto.UserScoreInfo(u.supportScore, u.point) FROM User u WHERE u.id = :userId")
    Optional<UserScoreInfo> findScoreAndPointByUserId(Long userId);

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

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.supportScore = :newScore WHERE u.id = :userId AND u.supportScore = :currentScore")
    int updateSupportScoreWithOptimisticLock(
            @Param("userId") Long userId,
            @Param("newScore") Integer newScore,
            @Param("currentScore") Integer currentScore
    );

    Page<User> findByNicknameContainingIgnoreCase(String trim, Pageable pageable);

    boolean existsByNickname(String nickname);
    boolean existsByPhoneNumber(String phoneNumber);

    // 본인을 제외한 중복 검사 (마이페이지 수정 시 사용)
    boolean existsByNicknameAndIdNot(String nickname, Long userId);
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long userId);
}
