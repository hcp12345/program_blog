package com.example.controller.user;

import com.example.dao.ArticleMapper;
import com.example.dao.CollectionMapper;
import com.example.dao.UserMapper;
import com.example.dto.MessageBean;
import com.example.model.Collection;
import com.example.service.CollectionService;
import com.example.utils.CheckNull;
import com.example.utils.ResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Created by hcp on 2020/3/21.
 */
@RestController
@Validated
@RequestMapping("/user/collection")
public class CollectionAction {
    @Autowired
    private CollectionMapper collectionMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private ArticleMapper articleMapper;
    @Autowired
    private CollectionService collectionService;

    /**
     * 收藏文章
     * @param collection
     * @return
     */
    @RequestMapping(value = "addCollection.action",method = RequestMethod.POST)
    public MessageBean addCollection(Collection collection){
        if(CheckNull.isObjectNull(articleMapper.selectByPrimaryKey(collection.getArticleId()))){
            return ResultUtil.failureFront("文章id不能为空");
        }
        if(CheckNull.isObjectNull(userMapper.selectByPrimaryKey(collection.getUserId()))){
            return ResultUtil.failureFront("作者id不能为空");
        }
        if(CheckNull.isObjectNull(userMapper.selectByPrimaryKey(collection.getCollectionPerson()))){
            return ResultUtil.failureFront("收藏者id不能为空");
        }
        if(!CheckNull.isObjectNull(collectionMapper.findCollectionByCollectionPersonAndArticleId(collection.getArticleId(),collection.getCollectionPerson()))){
            return ResultUtil.failure("请不要重复收藏");
        }
        if(collectionService.addCollection(collection)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }
}
