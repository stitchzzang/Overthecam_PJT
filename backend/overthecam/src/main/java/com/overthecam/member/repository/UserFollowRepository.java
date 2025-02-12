package com.overthecam.member.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.member.domain.UserFollow;
import com.overthecam.member.dto.UserProfileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    @Query("SELECT CASE WHEN COUNT(uf) > 0 THEN true ELSE false END " +
            "FROM UserFollow uf " +
            "WHERE uf.follower.id = :currentUserId AND uf.following.id = :targetUserId")
    boolean isFollowing(@Param("currentUserId") Long currentUserId,
                        @Param("targetUserId") Long targetUserId);

    // 팔로워 수 조회 (나를 팔로우하는 사람 수)
    @Query("SELECT COUNT(uf) FROM UserFollow uf WHERE uf.following.id = :userId")
    long countFollowersByUserId(@Param("userId") Long userId);

    // 팔로잉 수 조회 (내가 팔로우하는 사람 수)
    @Query("SELECT COUNT(uf) FROM UserFollow uf WHERE uf.follower.id = :userId")
    long countFollowingsByUserId(@Param("userId") Long userId);


    boolean existsByFollowerAndFollowing(User follower, User following);

    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);

    @Query("""
                SELECT new com.overthecam.member.dto.UserProfileInfo(
                    u.id,
                    u.nickname,
                    u.profileImage,
                    CASE WHEN EXISTS (
                        SELECT 1 FROM UserFollow uf2 
                        WHERE uf2.follower.id = :currentUserId 
                        AND uf2.following.id = u.id
                    ) THEN true ELSE false END
                )
                FROM User u
                INNER JOIN UserFollow uf ON u.id = uf.following.id
                WHERE uf.follower.id = :userId
            """)
    List<UserProfileInfo> findFollowingListWithStatus(
            @Param("userId") Long userId,
            @Param("currentUserId") Long currentUserId
    );

    @Query("""
                SELECT new com.overthecam.member.dto.UserProfileInfo(
                    u.id,
                    u.nickname,
                    u.profileImage,
                    CASE WHEN EXISTS (
                        SELECT 1 FROM UserFollow uf2 
                        WHERE uf2.follower.id = :currentUserId 
                        AND uf2.following.id = u.id
                    ) THEN true ELSE false END
                )
                FROM User u
                INNER JOIN UserFollow uf ON u.id = uf.follower.id
                WHERE uf.following.id = :userId
            """)
    List<UserProfileInfo> findFollowerListWithStatus(
            @Param("userId") Long userId,
            @Param("currentUserId") Long currentUserId
    );


}
