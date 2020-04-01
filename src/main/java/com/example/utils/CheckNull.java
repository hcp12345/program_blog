package com.example.utils;

/**
 * Created by hcp on 2020/3/21.
 */
public class CheckNull {
    public static boolean isNull(String...re){
        for (int i = 0; i < re.length; i++) {
            if(re[i]==null|| re[i].equals("")){
                System.out.println("空值");
                return true;
            }
        }
        return false;
    }
    public static boolean isObjectNull(Object...objects){
        for (int i = 0; i < objects.length ; i++) {
            if (objects[i] == null){
                return true;
            }
        }
        return false;
    }
}
