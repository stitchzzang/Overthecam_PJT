package com.overthecam.redis.util;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisOperations;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.SessionCallback;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RedisTransactionTemplate {
    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Redis 트랜잭션 실행
     * @param callback
     * @return
     * @param <T>
     */
    public <T> T execute(TransactionCallback<T> callback) {
        try {
            return redisTemplate.execute(new SessionCallback<T>() {
                @Override
                public T execute(RedisOperations operations) {
                    return callback.doInTransaction(operations);
                }
            });
        } catch (Exception e) {
            redisTemplate.unwatch();
            throw e;
        }
    }

    @FunctionalInterface
    public interface TransactionCallback<T> {
        T doInTransaction(RedisOperations operations);
    }
}
