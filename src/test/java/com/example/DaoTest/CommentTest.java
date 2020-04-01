package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.CommentMapper;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/22.
 */
public class CommentTest extends ProgramBlogApplicationTests {
    @Autowired
    private CommentMapper commentMapper;

    @Test
    public void test(){
        System.out.println(commentMapper.selectByPrimaryKey("1"));
    }
}
