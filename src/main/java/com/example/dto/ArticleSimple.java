package com.example.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Created by hcp on 2020/3/23.
 */
@Data
public class ArticleSimple {
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
}
