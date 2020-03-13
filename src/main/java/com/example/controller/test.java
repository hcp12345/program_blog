package com.example.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Created by hcp on 2020/3/6.
 */
@Controller
@RequestMapping(value = "/test")
public class test {

    @RequestMapping("/base.action")
    public String test(){
        System.out.println("成功了");
        return "test";
    }
}