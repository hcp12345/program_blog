package com.example.service.impl;

import com.example.dao.UserMapper;
import com.example.model.User;
import com.example.service.MailService;
import com.example.service.UserService;
import com.example.utils.CheckNull;
import com.example.utils.RandomUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author hcp
 */
@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private MailService mailService;

    @Override
    @Transactional
    public Boolean checkCode(String code) {
        User user = userMapper.getUserByCode(code);
        if(!CheckNull.isObjectNull(user)){
            user.setStatus(1);
            user.setCode("");            //把验证码清空，已经不需要了
            if(userMapper.updateByPrimaryKey(user) == 1){
                return true;
            }
            return false;
        }
        return false;
    }

    @Override
    public Boolean registerUser(String mailbox, String name, String password) {
        User user = new User();
        String code = RandomUtil.getUUID();
        user.setUserId(RandomUtil.getUUID());
        user.setMailbox(mailbox);
        user.setName(name);
        user.setPassword(password);
        user.setCode(code);
        if(userMapper.insert(user) == 1){
            if(mailService.sendMimeMail(mailbox,"博客系统账号激活邮件","<a href=\"/user/base/checkCode.action?code="+code+"\">激活请点击:"+code+"</a>")){
                return true;             //邮件发送成功
            }
            return false;                //邮件发送失败
        }
        return false;                    //添加用户记录失败
    }
}
