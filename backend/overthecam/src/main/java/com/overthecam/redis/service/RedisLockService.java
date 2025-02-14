package com.overthecam.redis.service;

import com.overthecam.common.exception.GlobalException;
import com.overthecam.redis.exception.RedisErrorCode;
import com.overthecam.redis.repository.RedisLockRepository;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * 서비스: lock 관리 및 실행
 */
@Service
@RequiredArgsConstructor
public class RedisLockService {
    private final RedisLockRepository lockRepository;

    /**
     * 락 획득 후 작업 실행
     * @param userId
     * @param task
     * @return
     * @param <T>
     */
    public <T> T executeWithLock(Long userId, Supplier<T> task) {
        try {
            if (!lockRepository.acquireLock(userId)) {
                throw new GlobalException(RedisErrorCode.LOCK_ACQUISITION_FAILED, "락 획득에 실패했습니다");
            }

            return task.get();
        } finally {
            lockRepository.releaseLock(userId);
        }
    }

    /**
     * 락 획득 후 작업 실행 (반환값 없음)
     * @param userId
     * @param task
     */
    public void executeWithLock(Long userId, Runnable task) {
        try {
            if (!lockRepository.acquireLock(userId)) {
                throw new GlobalException(RedisErrorCode.LOCK_ACQUISITION_FAILED, "락 획득에 실패했습니다");
            }

            task.run();
        } finally {
            lockRepository.releaseLock(userId);
        }
    }
}
