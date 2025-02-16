package com.overthecam.badwordfilter.service;

import com.overthecam.badwordfilter.FilterPolicy;
import com.overthecam.badwordfilter.dto.FilterResult;
import com.overthecam.badwordfilter.dto.FilteredChar;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.ahocorasick.trie.Emit;
import org.ahocorasick.trie.Trie;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class FilterService {

    public FilterResult filter(String text, Trie trie) {
        List<FilteredChar> filteredChars = new ArrayList<>();
        String currentText = text;

        // 우회 문자 필터링
        for (FilterPolicy policy : FilterPolicy.values()) {
            Pattern pattern = Pattern.compile(policy.regex);
            Matcher matcher = pattern.matcher(currentText);

            while (matcher.find()) {
                String match = matcher.group();
                int position = matcher.start();

                for (char c : match.toCharArray()) {
                    filteredChars.add(new FilteredChar(c, position, policy.type));
                }
            }

            currentText = matcher.replaceAll("");
        }

        // 비속어 검사 및 마스킹 처리
        boolean containsBanWord = false;
        String maskedText = currentText;

        // Trie에서 매칭되는 모든 비속어 찾기
        Collection<Emit> emits = trie.parseText(currentText);

        if (!emits.isEmpty()) {
            containsBanWord = true;

            // 비속어를 *로 마스킹 처리
            StringBuilder builder = new StringBuilder(currentText);
            // end 위치가 변경되지 않도록 뒤에서부터 처리
            List<Emit> sortedEmits = new ArrayList<>(emits);
            sortedEmits.sort((e1, e2) -> Integer.compare(e2.getStart(), e1.getStart()));

            for (Emit emit : sortedEmits) {
                int start = emit.getStart();
                int end = emit.getEnd() + 1;
                String stars = "*".repeat(end - start);
                builder.replace(start, end, stars);
            }
            maskedText = builder.toString();
        }

        return FilterResult.builder()
            .containsBanword(containsBanWord)
            .filteredText(maskedText)
            .filteredChars(filteredChars)
            .build();
    }

    public String reconstruct(FilterResult result, String filteredText) {
        if (result == null || filteredText == null || result.getFilteredChars() == null) {
            return filteredText;
        }

        StringBuilder reconstructed = new StringBuilder(filteredText);
        List<FilteredChar> sortedChars = new ArrayList<>(result.getFilteredChars());

        // position을 기준으로 오름차순 정렬
        sortedChars.sort((a, b) -> Integer.compare(a.getPosition(), b.getPosition()));

        // 현재까지 삽입된 문자 수를 추적
        int offset = 0;

        for (FilteredChar filteredChar : sortedChars) {
            int position = filteredChar.getPosition() + offset;

            // position이 현재 문자열 길이보다 크면 맨 뒤에 추가
            if (position > reconstructed.length()) {
                reconstructed.append(filteredChar.getCharacter());
            } else {
                reconstructed.insert(position, filteredChar.getCharacter());
            }

            // offset 증가
            offset++;
        }

        return reconstructed.toString();
    }
}