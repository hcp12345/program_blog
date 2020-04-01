package com.example.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Article {
    private String articleId;

    private String articleName;

    private Integer articleGood;

    private Integer articleFollows;

    private String userId;

    private String type;

    private String articleTag;

    private String articleCover;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
    private LocalDateTime articleDate;

    private Integer articleViews;

    private Integer articleComment;

    private String article;

    public String getArticleId() {
        return articleId;
    }

    public void setArticleId(String articleId) {
        this.articleId = articleId == null ? null : articleId.trim();
    }

    public String getArticleName() {
        return articleName;
    }

    public void setArticleName(String articleName) {
        this.articleName = articleName == null ? null : articleName.trim();
    }

    public Integer getArticleGood() {
        return articleGood;
    }

    public void setArticleGood(Integer articleGood) {
        this.articleGood = articleGood;
    }

    public Integer getArticleFollows() {
        return articleFollows;
    }

    public void setArticleFollows(Integer articleFollows) {
        this.articleFollows = articleFollows;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId == null ? null : userId.trim();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type == null ? null : type.trim();
    }

    public String getArticleTag() {
        return articleTag;
    }

    public void setArticleTag(String articleTag) {
        this.articleTag = articleTag == null ? null : articleTag.trim();
    }

    public String getArticleCover() {
        return articleCover;
    }

    public void setArticleCover(String articleCover) {
        this.articleCover = articleCover == null ? null : articleCover.trim();
    }

    public LocalDateTime getArticleDate() {
        return articleDate;
    }

    public void setArticleDate(LocalDateTime articleDate) {
        this.articleDate = articleDate;
    }

    public Integer getArticleViews() {
        return articleViews;
    }

    public void setArticleViews(Integer articleViews) {
        this.articleViews = articleViews;
    }

    public Integer getArticleComment() {
        return articleComment;
    }

    public void setArticleComment(Integer articleComment) {
        this.articleComment = articleComment;
    }

    public String getArticle() {
        return article;
    }

    public void setArticle(String article) {
        this.article = article == null ? null : article.trim();
    }
}