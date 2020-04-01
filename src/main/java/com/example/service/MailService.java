package com.example.service;

public interface MailService {

    /**
     * 发送多媒体类型邮件
     * @param to       发送对象
     * @param subject  题目
     * @param content 文本内容
     * @return
     */
    Boolean sendMimeMail(String to, String subject, String content);


}
