package com.example.utils;

import com.example.dto.MessageBean;

/**
 * Created by hcp on 2020/3/6.
 */
public class ResultUtil {

    private final static Integer CODE_SUCCESS = 200;         //请求成功代码

    private final static String MSG_SUCCESS = "操作成功";   //CODE_SUCCESS 对应的提示信息

    private final static Integer CODE_FAILURE_FRONT = 100;  //前端错误代码

    private final static String MSG_FAILURE_FRONT = "客户端系统出错"; //CODE_FAILURE_NORMAL 对应的提示信息

    private final static Integer CODE_FAILURE_BACK = 500;  //正常情况下请求成功，但数据或逻辑有误代码

    private final static String MSG_FAILURE_BACK = "系统出错"; //CODE_FAILURE_NORMAL 对应的提示信息

    private final static Integer VALID_FAILURE = 400;  //数据验证失败

    private final static String MSG_VALID_FAILURE = "操作失败"; //VALID_FAILURE 对应的提示信息

    /**
     * 公共
     * @param status
     * @param message
     * @param data
     * @return
     */
    public static MessageBean common(Integer status, String message , Object data){
        return new MessageBean(status,message,data);
    }

    /**
     * 请求成功
     * @param message
     * @param data
     * @return
     */
    public static MessageBean success(String message ,Object data){
        return common(CODE_FAILURE_FRONT,message,data);
    }
    public static MessageBean success(String message){
        return  success(message,null);
    }
    public static MessageBean success(Object data){
        return  success(MSG_SUCCESS,data);
    }
    public static MessageBean success(){
        return  success(MSG_SUCCESS,null);
    }

    /**
     * 客户端系统错误
     * @param message
     * @param data
     * @return
     */
    public static MessageBean failureFront(String message ,Object data){
        return common(CODE_FAILURE_FRONT,message,data);
    }
    public static MessageBean failureFront(String message){
        return  failureFront(message,null);
    }
    public static MessageBean failureFront(Object data){
        return  failureFront(MSG_FAILURE_FRONT,data);
    }
    public static MessageBean failureFront(){
        return  failureFront(MSG_FAILURE_FRONT,null);
    }


    /**
     * 后端系统错误
     * @param message
     * @param data
     * @return
     */
    public static MessageBean failureBack(String message ,Object data){
        return common(CODE_FAILURE_BACK,message,data);
    }
    public static MessageBean failureBack(String message){
        return  failureBack(message,null);
    }
    public static MessageBean failureBack(Object data){
        return  failureBack(MSG_FAILURE_BACK,data);
    }
    public static MessageBean failureBack(){
        return  failureBack(MSG_FAILURE_BACK,null);
    }

    /**
     * 正常错误
     * @param message 消息
     * @param data 数据
     * @return
     */
    public static MessageBean failure(String message ,Object data){
        return common(VALID_FAILURE,message,data);
    }
    public static MessageBean failure(String message ){
        return failure(message,null);
    }
    public static MessageBean failure(Object data){
        return  failure(MSG_VALID_FAILURE,data);
    }
    public static MessageBean failure(){
        return  failure(MSG_VALID_FAILURE,null);
    }

}
