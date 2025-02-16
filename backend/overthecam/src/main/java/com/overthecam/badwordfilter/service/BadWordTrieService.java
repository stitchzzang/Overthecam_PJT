package com.overthecam.badwordfilter.service;


import com.overthecam.badwordfilter.domain.BadWord;
import com.overthecam.badwordfilter.repository.BadWordRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.concurrent.locks.ReentrantReadWriteLock;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.ahocorasick.trie.Trie;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BadWordTrieService {

    private final BadWordRepository badWordRepository;

    @Getter
    private Trie trie;

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();


    @PostConstruct
    public void init() {
        buildTrie();
    }

    @Transactional
    public void refreshTrie() {
        lock.writeLock().lock();
        try {
            buildTrie();
        } finally {
            lock.writeLock().unlock();
        }
    }

    public Trie getTrie() {
        lock.readLock().lock();
        try {
            return this.trie;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void buildTrie() {
        List<BadWord> badWordList = badWordRepository.findAll();

        // BadWord 객체들에서 word만 추출하여 리스트로 변환
        List<String> words = badWordList.stream()
            .map(BadWord::getWord)
            .collect(Collectors.toList());

        this.trie = Trie.builder()
            .addKeywords(words)
            .build();
    }

    // Trie 검색 메서드 추가
    public boolean containsBadWord(String text) {
        if (trie == null) {
            buildTrie();
        }
        return trie.containsMatch(text);
    }
}
