package com.example.service.impl;

import com.example.dao.ArticleMapper;
import com.example.dao.CommentMapper;
import com.example.dao.NoticeMapper;
import com.example.dao.UserMapper;
import com.example.model.Article;
import com.example.model.Comment;
import com.example.model.Notice;
import com.example.model.User;
import com.example.service.CommentService;
import com.example.utils.RandomUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Created by hcp on 2020/3/21.
 */
@Service
public class CommentServiceImpl implements CommentService{
    @Autowired
    private CommentMapper commentMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private NoticeMapper noticeMapper;
    @Autowired
    private ArticleMapper articleMapper;


    @Override
    @Transactional
    public Boolean addGoodForComment(String commentId,String userId) {
        Comment comment = commentMapper.selectByPrimaryKey(commentId);
        User user = userMapper.selectByPrimaryKey(comment.getUserId());
        comment.setCommentGoods(comment.getCommentGoods()+1);
        if(commentMapper.updateByPrimaryKey(comment) == 1){            //更新评论点赞数
            user.setGood(user.getGood()+1);
            if(userMapper.updateByPrimaryKey(user) == 1){              //更新作者
                User user1 = userMapper.selectByPrimaryKey(userId);     //点赞的人
                Notice notice = new Notice();
                notice.setNotice(RandomUtil.getUUID());
                notice.setNotice(user1.getName()+"点赞了您的评论");
                notice.setNoticePerson(user.getUserId());               //被通知者（文章作者）
                notice.setUserId(userId);                               //操作者(点赞的人)
                notice.setNoticeDate(LocalDateTime.now());
                notice.setNoticeType("2");
                notice.setTargetId(commentId);
                if(noticeMapper.insert(notice) == 0){
                    return false;
                }
                return true;
            }else {
                return false;
            }
        }
        return false;
    }

    @Override
    @Transactional
    public Boolean addComment(Comment comment) {
        comment.setCommentId(RandomUtil.getUUID());
        comment.setCommentDate(LocalDateTime.now());
        if(commentMapper.insert(comment) == 1){                                                //评论记录插入成功
            Article article = articleMapper.selectByPrimaryKey(comment.getArticleId());        //不管是对评论进行评论还是对文章进行评论，文章评论数都加1
            article.setArticleComment(article.getArticleComment()+1);
            if(articleMapper.updateByPrimaryKey(article) == 1){                                //文章更新成功
                Notice notice = new Notice();                                                    //添加一条通知记录
                notice.setNotice(RandomUtil.getUUID());
                notice.setNoticePerson(comment.getUserId());                                     //被通知者（文章作者）
                notice.setUserId(comment.getCommentPerson());                                    //操作者(进行收藏的人)
                notice.setNoticeDate(LocalDateTime.now());
                if(comment.getCommentTag() == "1"){
                    notice.setNotice(comment.getCommentPerson()+"评论了您的文章");
                    notice.setNoticeType("1");
                    notice.setTargetId(comment.getArticleId());
                }else if(comment.getCommentTag() == "2"){
                    notice.setNotice(comment.getCommentPerson()+"评论了您的评论");
                    notice.setNoticeType("2");
                    notice.setTargetId(comment.getCommentObject());
                }
                if(noticeMapper.insert(notice) == 0){
                    return false;
                }
                return true;
            }
            return false;
        }
        return false;

    }

    @Override
    @Transactional
    public Boolean delCommment(String commentId) {
        Comment comment = commentMapper.selectByPrimaryKey(commentId);
        if(commentMapper.deleteByPrimaryKey(commentId) == 1){                                 //评论删除成功
            Article article = articleMapper.selectByPrimaryKey(comment.getArticleId());        //不管是对评论进行评论还是对文章进行评论，文章评论数都减1
            article.setArticleComment(article.getArticleComment()-1);
            if(articleMapper.updateByPrimaryKey(article) == 1){                                //文章更新成功
                return true;
            }
            return false;
        }
        return true;
    }
}
