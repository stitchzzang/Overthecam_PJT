package com.overthecam.member.repository;

import com.overthecam.auth.domain.User;
import com.overthecam.member.domain.UserFollow;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {

    boolean existsByFollowerAndFollowing(User follower, User following);
    Optional<UserFollow> findByFollowerAndFollowing(User follower, User following);


}
