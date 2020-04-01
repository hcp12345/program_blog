package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.ArticleMapper;
import com.example.model.Article;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Created by hcp on 2020/3/21.
 */
public class ArticleTest extends ProgramBlogApplicationTests {
    @Autowired
    private ArticleMapper articleMapper;

    @Test
    public void testSelect(){

        //Article article = articleMapper.selectArticleByArticleName("测试文章1");
        Article article = articleMapper.selectByPrimaryKey("1");
        System.out.println(article);
//        if(CheckNull.isObjectNull(article)){
//            System.out.println("a");
//        }
//        List<Article> articleList = articleMapper.findArticlesByTypeAndTag(null,null);
//        List<Article> articleList = articleMapper.findPopularArticles("1");
//        List<Article> articleList = articleMapper.findArticleByUserId("1");
//        for (Article a : articleList){
//            System.out.println(a);
//        }
    }


}
