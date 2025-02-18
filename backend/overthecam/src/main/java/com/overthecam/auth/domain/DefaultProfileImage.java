package com.overthecam.auth.domain;

import lombok.Getter;

import java.util.Random;

@Getter
public enum DefaultProfileImage {
    BEAR("https://d26tym50939cjl.cloudfront.net/profiles/profile_bear.jpg"),
    CAT("https://d26tym50939cjl.cloudfront.net/profiles/profile_cat.jpg"),
    PERSON("https://d26tym50939cjl.cloudfront.net/profiles/profile_person.jpg"),
    RABBIT("https://d26tym50939cjl.cloudfront.net/profiles/profile_rabbit.jpg");

    private final String url;

    DefaultProfileImage(String url) {
        this.url = url;
    }

    public static String getRandomProfileUrl() {
        DefaultProfileImage[] profiles = values();
        return profiles[new Random().nextInt(profiles.length)].getUrl();
    }
}
