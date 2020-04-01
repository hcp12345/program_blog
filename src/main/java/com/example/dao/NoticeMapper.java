package com.example.dao;

import com.example.model.Notice;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeMapper {
    int deleteByPrimaryKey(String noticeId);

    int insert(Notice record);

    int insertSelective(Notice record);

    Notice selectByPrimaryKey(String noticeId);

    int updateByPrimaryKeySelective(Notice record);

    int updateByPrimaryKey(Notice record);

    /**
     * 获取本人所有有效通知
     * @param noticePerson    被通知对象
     * @return
     */
    List<Notice> getNoticeByNoticePerson(@Param("noticePerson")String noticePerson);
}