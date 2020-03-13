package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.UserMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/6.
 */
public class UserTest extends ProgramBlogApplicationTests {
    @Autowired
    private UserMapper userMapper;

    @Test
    public void testGetUser(){
        System.out.println(userMapper.selectByPrimaryKey("1"));
    }
}
