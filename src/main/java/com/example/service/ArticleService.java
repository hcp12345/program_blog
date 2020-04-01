package com.example.service;

import com.example.model.Article;

import java.util.List;

/**
 * Created by hcp on 2020/3/21.
 */
public interface ArticleService {
    /**
     * 发布文章
     * @param article
     * @return
     */
    Boolean createArticle(Article article);

    /**
     * 删除文章
     * @param articleId
     * @return
     */
    Boolean delArticle(String articleId);

    /**
     * 通过类型和标记获取文章
     * @param type
     * @param articleTag
     * @return
     */
    List<Article> findArticleByTypeAndArticleTag(String type,String articleTag);

    /**
     * 点赞文章
     * @param articleId
     * @param userId   点赞的人
     * @return
     */
    Boolean addGoodForArticle(String articleId,String userId);


}
