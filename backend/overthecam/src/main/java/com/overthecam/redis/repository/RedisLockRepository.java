package com.overthecam.redis.repository;

import com.overthecam.redis.util.RedisKeyGenerator;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Repository;

/**
 * 저장소: Redis의 락 관련 CRUD
 */
@Repository
@RequiredArgsConstructor
public class RedisLockRepository {
    private final RedisTemplate<String, Object> redisTemplate;

    private static final long DEFAULT_LOCK_TIMEOUT = 3000; // 3 seconds

    public boolean acquireLock(Long userId) {
        String lockKey = RedisKeyGenerator.getLockKey(userId);
        Boolean acquired = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "LOCKED", DEFAULT_LOCK_TIMEOUT, TimeUnit.MILLISECONDS);
        return Boolean.TRUE.equals(acquired);
    }

    public void releaseLock(Long userId) {
        String lockKey = RedisKeyGenerator.getLockKey(userId);
        redisTemplate.delete(lockKey);
    }

    public boolean isLocked(Long userId) {
        String lockKey = RedisKeyGenerator.getLockKey(userId);
        return Boolean.TRUE.equals(redisTemplate.hasKey(lockKey));
    }
}
