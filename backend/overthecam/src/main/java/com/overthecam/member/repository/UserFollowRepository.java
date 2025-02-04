package com.overthecam.member.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.member.domain.UserFollow;
import java.util.List;
import java.util.Optional;

import com.overthecam.member.dto.UserProfileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);

    @Query("""
        SELECT new com.overthecam.member.dto.UserProfileInfo(
            u.userId,
            u.nickname,
            u.profileImage,
            CASE WHEN EXISTS (
                SELECT 1 FROM UserFollow uf2 
                WHERE uf2.follower.userId = :currentUserId 
                AND uf2.following.userId = u.userId
            ) THEN true ELSE false END
        )
        FROM User u
        INNER JOIN UserFollow uf ON u.userId = uf.following.userId
        WHERE uf.follower.userId = :userId
    """)
    List<UserProfileInfo> findFollowingListWithStatus(
            @Param("userId") Long userId,
            @Param("currentUserId") Long currentUserId
    );

    @Query("""
        SELECT new com.overthecam.member.dto.UserProfileInfo(
            u.userId,
            u.nickname,
            u.profileImage,
            CASE WHEN EXISTS (
                SELECT 1 FROM UserFollow uf2 
                WHERE uf2.follower.userId = :currentUserId 
                AND uf2.following.userId = u.userId
            ) THEN true ELSE false END
        )
        FROM User u
        INNER JOIN UserFollow uf ON u.userId = uf.follower.userId
        WHERE uf.following.userId = :userId
    """)
    List<UserProfileInfo> findFollowerListWithStatus(
            @Param("userId") Long userId,
            @Param("currentUserId") Long currentUserId
    );
}
