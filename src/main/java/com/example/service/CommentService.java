package com.example.service;

import com.example.model.Comment;

/**
 * Created by hcp on 2020/3/21.
 */
public interface CommentService {

    /**
     * 点赞评论
     * @param commentId
     * @return
     */
    Boolean addGoodForComment(String commentId,String userId);

    /**
     * 添加评论
     * @param comment
     * @return
     */
    Boolean addComment(Comment comment);

    /**
     * 删除评论
     * @param commentId
     * @return
     */
    Boolean delCommment(String commentId);
}
