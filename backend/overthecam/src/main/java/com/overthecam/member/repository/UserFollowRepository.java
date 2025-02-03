package com.overthecam.member.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.member.domain.UserFollow;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);

    @Query("SELECT uf.following FROM UserFollow uf WHERE uf.follower.userId = :userId")
    List<User> findFollowedUsersByUserId(@Param("userId") Long userId);

    @Query("SELECT uf.follower FROM UserFollow uf WHERE uf.following.userId = :userId")
    List<User> findFollowersByUserId(@Param("userId") Long userId);

}
