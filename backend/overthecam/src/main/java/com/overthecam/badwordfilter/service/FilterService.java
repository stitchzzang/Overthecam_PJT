package com.overthecam.badwordfilter.service;

import com.overthecam.badwordfilter.FilterPolicy;
import com.overthecam.badwordfilter.dto.FilterResult;
import com.overthecam.badwordfilter.dto.FilteredChar;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.ahocorasick.trie.Emit;
import org.ahocorasick.trie.Trie;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FilterService {

    public FilterResult filter(String text, Trie trie) {
        List<FilteredChar> filteredChars = new ArrayList<>();
        String currentText = text;

        // 1단계: 특수문자, 중복 문자 등 필터링
        Map<Integer, Integer> positionMap = new HashMap<>();  // 원본 위치 -> 필터링 후 위치 매핑
        Map<Integer, Integer> reverseMap = new HashMap<>();   // 필터링 후 위치 -> 원본 위치 매핑
        StringBuilder cleanText = new StringBuilder();

        for (int i = 0, cleanIndex = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            boolean shouldKeep = true;

            // 특수문자, 공백 등 필터링
            for (FilterPolicy policy : FilterPolicy.values()) {
                if (String.valueOf(c).matches(policy.regex)) {
                    filteredChars.add(new FilteredChar(c, i, policy.type));
                    shouldKeep = false;
                    break;
                }
            }

            if (shouldKeep) {
                positionMap.put(i, cleanIndex);
                reverseMap.put(cleanIndex, i);
                cleanText.append(c);
                cleanIndex++;
            }
        }

        // 2단계: 비속어 감지 및 마스킹
        boolean containsBanWord = false;
        String maskedText = text;  // 원본 텍스트로 시작

        Collection<Emit> emits = trie.parseText(cleanText.toString());
        if (!emits.isEmpty()) {
            containsBanWord = true;
            StringBuilder maskedBuilder = new StringBuilder(text);

            // 감지된 비속어 위치를 원본 텍스트 위치로 변환하여 마스킹
            for (Emit emit : emits) {
                int originalStart = reverseMap.get(emit.getStart());
                int originalEnd = reverseMap.get(emit.getEnd());

                // 원본 텍스트에서 해당 범위의 실제 문자 수 계산
                int realLength = 0;
                for (int i = originalStart; i <= originalEnd; i++) {
                    if (!String.valueOf(text.charAt(i)).matches("[\\s\\p{Punct}]")) {
                        realLength++;
                    }
                }

                // 마스킹 처리
                for (int i = originalStart; i <= originalEnd; i++) {
                    char currentChar = text.charAt(i);
                    if (!String.valueOf(currentChar).matches("[\\s\\p{Punct}]")) {
                        maskedBuilder.setCharAt(i, '♡');
                    }
                }
            }
            maskedText = maskedBuilder.toString();
        }

        return FilterResult.builder()
            .containsBanword(containsBanWord)
            .filteredText(maskedText)
            .filteredChars(filteredChars)
            .build();
    }

    public String reconstruct(FilterResult result, String filteredText) {
        if (result == null || filteredText == null) {
            return filteredText;
        }

        // 필터링된 텍스트가 이미 마스킹과 특수문자를 포함하고 있으므로,
        // 추가적인 재구성이 필요하지 않음
        return filteredText;
    }
}