package com.example.dao;

import com.example.model.Comment;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentMapper {
    int deleteByPrimaryKey(String commentId);

    int insert(Comment record);

    int insertSelective(Comment record);

    Comment selectByPrimaryKey(String commentId);

    int updateByPrimaryKeySelective(Comment record);

    int updateByPrimaryKey(Comment record);

    /**
     * 获取1级评论列表
     * @param articleId
     * @return
     */
    List<Comment> getFirstComments(@Param("articleId")String articleId);

    /**
     * 获取2级评论列表
     * @param commentObject
     * @return
     */
    List<Comment> getSecondComments(@Param("commentObject")String commentObject);

}