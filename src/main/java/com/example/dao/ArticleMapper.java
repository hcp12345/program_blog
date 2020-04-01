package com.example.dao;

import com.example.model.Article;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArticleMapper {
    int deleteByPrimaryKey(String articleId);

    int insert(Article record);

    int insertSelective(Article record);

    Article selectByPrimaryKey(String articleId);

    int updateByPrimaryKeySelective(Article record);

    int updateByPrimaryKeyWithBLOBs(Article record);

    int updateByPrimaryKey(Article record);

    /**
     * 由文章名查文章
     * @param articleName
     * @return
     */
    Article selectArticleByArticleName(@Param("articleName")String articleName);

    /**
     * 按文章类型和标记查文章
     * @param type
     * @param articleTag
     * @return
     */
    List<Article> findArticlesByTypeAndTag(@Param("type")String type,@Param("articleTag")String articleTag);

    /**
     * 显示热门文章 按评论数递减
     * @param articleTag
     * @return
     */
    List<Article> findPopularArticles(@Param("articleTag")String articleTag);

    /**
     * 根据UserId查找文章
     * @param userId      作者id
     * @return
     */
    List<Article> findArticleByUserId(@Param("userId")String userId);
}