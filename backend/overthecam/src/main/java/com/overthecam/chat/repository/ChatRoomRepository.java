package com.overthecam.chat.repository;

import com.overthecam.chat.domain.ChatRoom;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // battle_id로 채팅방 찾기
    Optional<ChatRoom> findByBattleId(Long battleId);

    // active 상태인 채팅방만 찾기
    List<ChatRoom> findByActiveTrue();

    // battle_id로 채팅방 존재 여부 확인
    boolean existsByBattleId(Long battleId);
}
