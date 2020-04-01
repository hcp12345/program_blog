package com.example.service;

/**
 * @author hcp
 */
public interface UserService {

    /**
     * 根据验证码判断邮箱是否激活
     * @param code
     * @return
     */
    Boolean checkCode(String code);

    /**
     * 注册
     * @param mailbox
     * @param name
     * @param password
     * @return
     */
    Boolean registerUser(String mailbox, String name, String password);

}
