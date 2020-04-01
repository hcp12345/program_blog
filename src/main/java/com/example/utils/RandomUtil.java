package com.example.utils;

import java.util.UUID;

/**
 * Created by hcp on 2020/3/21.
 */
public class RandomUtil {
    public static String getUUID(){
        return UUID.randomUUID().toString().replace("-", "");
    }
}
