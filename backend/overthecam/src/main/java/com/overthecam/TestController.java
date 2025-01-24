package com.overthecam;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/")
    public String root() {
        return "root ok";
    }

    @RequestMapping("/test")
    public String test(){
        return "ci/cd test ok~~";
    }
}
