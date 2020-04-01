package com.example.service.impl;

import com.example.dao.ArticleMapper;
import com.example.dao.NoticeMapper;
import com.example.dao.UserMapper;
import com.example.model.Article;
import com.example.model.Notice;
import com.example.model.User;
import com.example.service.ArticleService;
import com.example.service.FollowService;
import com.example.utils.RandomUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Created by hcp on 2020/3/21.
 */
@Service
public class ArticleServiceImpl implements ArticleService {
    @Autowired
    private ArticleMapper articleMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private NoticeMapper noticeMapper;
    @Autowired
    private FollowService followService;

    @Override
    @Transactional
    public Boolean createArticle(Article article) {
        String articleId = RandomUtil.getUUID();
        article.setArticleId(articleId);
        article.setArticleDate(LocalDateTime.now());
        if(articleMapper.insert(article) == 0){
            System.out.println("文章插入失败");
            return false;
        }
        User user = userMapper.selectByPrimaryKey(article.getUserId());
        user.setArticleCounts(user.getArticleCounts()+1);
        if(userMapper.updateByPrimaryKey(user) == 1){
            List<User> users = followService.getPersonByUser(article.getUserId());       //获取关注了我的人
            for(User u:users){                                                             //逐个发通知
                Notice notice = new Notice();
                notice.setNotice(RandomUtil.getUUID());
                notice.setNotice("您关注的"+article.getUserId()+"发布了新文章");
                notice.setNoticePerson(u.getUserId());               //被通知者
                notice.setUserId(article.getUserId());               //操作者
                notice.setNoticeDate(LocalDateTime.now());
                notice.setNoticeType("1");
                notice.setTargetId(articleId);
                if(noticeMapper.insert(notice) == 0){
                    return false;
                }
            }
            return true;
        }else {
            return false;
        }

    }

    @Override
    @Transactional
    public Boolean delArticle(String articleId) {
        Article article = articleMapper.selectByPrimaryKey(articleId);
        if(articleMapper.deleteByPrimaryKey(articleId) == 0){
            return false;
        }
        User user = userMapper.selectByPrimaryKey(article.getUserId());
        user.setArticleCounts(user.getArticleCounts()-1);
        if(userMapper.updateByPrimaryKey(user) == 1){
            return true;
        }else {
            return false;
        }

    }

    @Override
    public List<Article> findArticleByTypeAndArticleTag(String type, String articleTag) {
        List<Article> articleList = articleMapper.findArticlesByTypeAndTag(type,articleTag);
        return articleList;
    }

    @Override
    @Transactional
    public Boolean addGoodForArticle(String articleId,String userId) {
        Article article = articleMapper.selectByPrimaryKey(articleId);
        User user = userMapper.selectByPrimaryKey(article.getUserId());   //作者
        article.setArticleGood(article.getArticleGood()+1);
        if(articleMapper.updateByPrimaryKey(article) == 1){
            user.setGood(user.getGood()+1);
            if(userMapper.updateByPrimaryKey(user) == 1){         //更新成功
                User user1 = userMapper.selectByPrimaryKey(userId);     //点赞的人
                Notice notice = new Notice();
                notice.setNotice(RandomUtil.getUUID());
                notice.setNotice(user1.getName()+"点赞了您的文章"+article.getArticleName());
                notice.setNoticePerson(user.getUserId());               //被通知者（文章作者）
                notice.setUserId(userId);               //操作者(点赞的人)
                notice.setNoticeDate(LocalDateTime.now());
                notice.setNoticeType("1");
                notice.setTargetId(articleId);
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
}
