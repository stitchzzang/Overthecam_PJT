package com.overthecam.battle.domain;

import java.util.Random;

public enum DefaultThumbnail {
    THUMBNAIL_1("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+1.png"),
    THUMBNAIL_2("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+2.png"),
    THUMBNAIL_3("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+3.png"),
    THUMBNAIL_4("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+4.png"),
    THUMBNAIL_5("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+5.png"),
    THUMBNAIL_6("https://d26tym50939cjl.cloudfront.net/thumbnails/thumbnail+6.png");

    private final String url;

    DefaultThumbnail(String url) {
        this.url = url;
    }

    public String getUrl() {
        return url;
    }

    public static String getRandomThumbnailUrl() {
        DefaultThumbnail[] thumbnails = values();
        return thumbnails[new Random().nextInt(thumbnails.length)].getUrl();
    }
}
