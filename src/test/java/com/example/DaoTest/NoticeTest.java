package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.NoticeMapper;
import com.example.model.Notice;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/22.
 */
public class NoticeTest extends ProgramBlogApplicationTests {
    @Autowired
    private NoticeMapper noticeMapper;

    @Test
    public void test(){
        for(Notice n: noticeMapper.getNoticeByNoticePerson("1")){
            System.out.println(n);
        }
    }
}
