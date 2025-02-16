package com.overthecam.badwordfilter.service;


import com.overthecam.badwordfilter.domain.BadWord;
import com.overthecam.badwordfilter.repository.BadWordRepository;
import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.ahocorasick.trie.Trie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BadWordTrieService {

    private final BadWordRepository badWordRepository;

    @Getter
    private Trie trie;

    @PostConstruct
    public void init() {
        buildTrie();
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
