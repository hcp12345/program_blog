package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.UserMapper;
import com.example.model.User;
import org.junit.Test;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/6.
 */
public class UserTest extends ProgramBlogApplicationTests {
    private static final org.slf4j.Logger log = LoggerFactory.getLogger(UserTest.class);
    @Autowired
    private UserMapper userMapper;

    @Test
    public void testGetUser(){
        User user1 = userMapper.selectByPrimaryKey("1");
        log.info("{}",user1);
        User user2 = userMapper.selectByPrimaryKey("1");
        log.info("{}",user2);
        if(user1.equals(user2)){
            log.info("结果：{}",true);
            log.info("----{}---",true);
            log.info("正确");
        }else {
            log.info("{}",false);
        }
        System.out.println(userMapper.selectByPrimaryKey("1"));
    }

    @Test
    public void testSelect(){
        System.out.println(userMapper.selectUserByNameAndPassword("hcp","abc12345"));
//        System.out.println(userMapper.selectUserByMailboxAndPassword("2934819354@qq.com","admin"));
        User user = userMapper.selectUserByNameAndPassword("hcp","abc12345");
        user.setFollows(user.getFollows()+1);
        System.out.println(user.getFollows());
        userMapper.updateByPrimaryKey(user);
        System.out.println(userMapper.selectUserByNameAndPassword("hcp","abc12345"));
    }

    @Test
    public void testGet(){
//
    }

}
