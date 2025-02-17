package com.overthecam.security.config;

public enum SecurityPath {
    // Auth 관련 경로
    SIGNUP("/api/auth/signup"),
    LOGIN("/api/auth/login"),
    findEmail("/api/auth/find-email"),
    verifyPasswordReset("/api/auth/verify-password-reset"),
    resetPassword("/api/auth/reset-password"),

    // WebSocket 관련 경로
    WS_CONNECT("/api/ws-connect/**"),
    WS_CONNECT_ROOT("/api/ws-connect"),
    WS_CONNECT_INFO("/api/ws-connect/info"),


    // Messaging 관련 경로
    PUBLISH("/api/publish/**"),
    SUBSCRIBE("/api/subscribe/**"),

    // 투표 관련 경로
    VOTE_LIST("/api/vote/list"),

    // 배틀 관련 경로
    BATTLE_VIEW_LIST("/api/battle/room/all"),

    // 검색 관련 경로
    SEARCH("/api/search/**"),

    // 욕설 필터링 관련 경로
    BADWORD_FILTER("/api/bad-word/**");

    private final String path;

    SecurityPath(String path) {
        this.path = path;
    }

    public static String[] getAllPublicPaths() {
        return java.util.Arrays.stream(values())
                .map(SecurityPath::getPath)
                .toArray(String[]::new);
    }

    public static boolean matches(String uri) {
        return java.util.Arrays.stream(values())
                .anyMatch(securityPath -> {
                    String pattern = securityPath.getPath();
                    // /** 패턴 처리
                    if (pattern.endsWith("/**")) {
                        String basePattern = pattern.substring(0, pattern.length() - 2);
                        return uri.startsWith(basePattern);
                    }
                    // 정확한 경로 매칭
                    return pattern.equals(uri);
                });
    }

    public String getPath() {
        return this.path;
    }
}