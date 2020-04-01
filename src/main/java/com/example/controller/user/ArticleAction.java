package com.example.controller.user;

import com.example.dao.ArticleMapper;
import com.example.dao.CollectionMapper;
import com.example.dao.UserMapper;
import com.example.dto.MessageBean;
import com.example.model.Article;
import com.example.model.Collection;
import com.example.service.ArticleService;
import com.example.utils.CheckNull;
import com.example.utils.ResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by hcp on 2020/3/21.
 */
@RestController
@Validated
@RequestMapping("/user/article")
public class ArticleAction {
    @Autowired
    private ArticleMapper articleMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private ArticleService articleService;
    @Autowired
    private CollectionMapper collectionMapper;


    /**
     * 发布文章
     * @param article
     * @return
     */
    @RequestMapping(value = "/createArticle.action",method = RequestMethod.POST)
    public MessageBean createArticle(Article article){
        if(!CheckNull.isObjectNull(articleMapper.selectArticleByArticleName(article.getArticleName()))){
            return ResultUtil.failure("此文章已存在，不可重复！");
        }
        if(CheckNull.isObjectNull(userMapper.selectByPrimaryKey(article.getUserId()))){
            return ResultUtil.failure("作者id不能为空");
        }
        if(articleService.createArticle(article)){
            return ResultUtil.success();
        }else {
            return ResultUtil.failure("文章插入失败");
        }
    }

    /**
     * 删除文章
     * @param articleId
     * @return
     */
    @RequestMapping(value = "/delArticle.action",method = RequestMethod.DELETE)
    public MessageBean createArticle(@NotBlank(message = "文章id不能为空") String articleId){
        Article article = articleMapper.selectByPrimaryKey(articleId);
        if(CheckNull.isObjectNull(article)){                    //判断文章是否为空
            return ResultUtil.failure("文章id错误");
        }
        if(articleService.delArticle(articleId)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }


    /**
     * 修改文章
     * @param article
     * @return
     */
    @RequestMapping(value = "/updateArticle.action",method = RequestMethod.PUT)
    public MessageBean updateArticle(Article article){
        if(articleMapper.updateByPrimaryKey(article) == 0){
            return ResultUtil.failure();
        }
        return ResultUtil.success();
    }

    /**
     * 查看文章
     * @param articleId
     * @return
     */
    @RequestMapping(value = "/lookArticle.action",method = RequestMethod.GET)
    public MessageBean lookArticle(@NotBlank(message = "文章id不能为空") String articleId){
        Article article = articleMapper.selectByPrimaryKey(articleId);
        if(CheckNull.isObjectNull(article)){
            return ResultUtil.failure("文章id错误");
        }
        article.setArticleViews(article.getArticleViews()+1);            //查看文章，文章阅读数加1
        if(articleMapper.updateByPrimaryKey(article) == 1) {
            return ResultUtil.success(article);
        } else {
            return ResultUtil.failure();
        }
    }

    /**
     * 查找所有文章
     * @return
     */
    @RequestMapping(value = "/findAllArticles.action",method = RequestMethod.GET)
    public MessageBean findAllArticle(){
        List<Article> articleList = articleService.findArticleByTypeAndArticleTag(null,null);
        return ResultUtil.success(articleList);
    }

    /**
     * 根据类型查看文章
     * @param type 文章类型
     * @return
     */
    @RequestMapping(value = "/findArticlesByCondition.action",method = RequestMethod.GET)
    public MessageBean findArticleByType(String type){
        List<Article> articleList = articleService.findArticleByTypeAndArticleTag(type,null);
        return ResultUtil.success(articleList);
    }

    /**
     * 查看热门文章
     * @param articleTag  作品标记 1代表文章，2代表讨论
     */
    @RequestMapping(value = "/findPopularArticles.action",method = RequestMethod.GET)
    public MessageBean findPopularArticles(String articleTag){
        List<Article> articleList = articleMapper.findPopularArticles(articleTag);
        return ResultUtil.success(articleList);
    }

    /**
     * 显示原创文章
     * @param userId
     * @return
     */
    @RequestMapping(value = "/findOriginalArticles.action",method = RequestMethod.GET)
    public MessageBean findOriginalArticles(@NotBlank(message = "用户id不能为空") String userId){
        List<Article> articleList = articleMapper.findArticleByUserId(userId);
        return ResultUtil.success(articleList);
    }

    /**
     * 获取收藏文章
     * @param userId
     * @return
     */
    @RequestMapping(value = "/findArticleByCollection.action",method = RequestMethod.POST)
    public MessageBean findArticleByCollection(@NotBlank(message = "用户id不能为空")String userId){
        List<Collection> collections = collectionMapper.findCollectionByCollectionPerson(userId);
        List<Article> articleList = new ArrayList<>();
        for (Collection c : collections){
            articleList.add(articleMapper.selectByPrimaryKey(c.getArticleId()));
        }
        return ResultUtil.success(articleList);
    }

    /**
     * 点赞文章
     * @param articleId
     * @param userId       点赞的人
     * @return
     */
    @RequestMapping(value = "addGoodForArticle.action",method = RequestMethod.POST)
    public MessageBean addGoodsForArticle(@NotBlank(message = "文章id不能为空") String articleId,@NotBlank(message = "点赞者id不能为空")String userId){
        if(articleService.addGoodForArticle(articleId,userId)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }
}
