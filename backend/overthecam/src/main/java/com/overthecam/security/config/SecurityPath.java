package com.overthecam.security.config;

public enum SecurityPath {
    // Auth 관련 경로
    SIGNUP("/api/auth/signup"),
    LOGIN("/api/auth/login"),

    // WebSocket 관련 경로
    WS_CONNECT("/api/ws-connect/**"),
    WS_CONNECT_ROOT("/api/ws-connect"),
    WS_CONNECT_INFO("/api/ws-connect/info"),

    // Messaging 관련 경로
    PUBLISH("/api/publish/**"),
    SUBSCRIBE("/api/subscribe/**"),

    // 커뮤니티 투표 관련 경로
    COMMUNITY_VOTE_CREATE("/api/community/votes"),            // 커뮤니티 투표 생성
    COMMUNITY_VOTE_LIST("/api/community/votes"),              // 커뮤니티 투표 목록 조회
    COMMUNITY_VOTE_DETAIL("/api/community/votes/{voteId}"),   // 특정 커뮤니티 투표 상세 조회
    COMMUNITY_VOTE_PARTICIPATE("/api/community/votes/{voteId}/vote"),  // 커뮤니티 투표 참여
    COMMUNITY_VOTE_COMMENT("/api/community/votes/{voteId}/comments"); // 커뮤니티 투표 댓글 관련



    private final String path;

    SecurityPath(String path) {
        this.path = path;
    }

    public String getPath() {
        return this.path;
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
}