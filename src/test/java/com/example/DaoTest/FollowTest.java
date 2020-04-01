package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.FollowMapper;
import com.example.service.FollowService;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/22.
 */
public class FollowTest extends ProgramBlogApplicationTests {
    @Autowired
    private FollowMapper followMapper;
    @Autowired
    private FollowService followService;

    @Test
    public void test(){
        System.out.println(followMapper.getFollowByNoticePerson("1"));
        System.out.println(followService.getPersonByFollow("1"));
    }
}
