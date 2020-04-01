package com.example.dao;

import com.example.model.Collection;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionMapper {
    int deleteByPrimaryKey(String collectionId);

    int insert(Collection record);

    int insertSelective(Collection record);

    Collection selectByPrimaryKey(String collectionId);

    int updateByPrimaryKeySelective(Collection record);

    int updateByPrimaryKey(Collection record);

    /**
     * 获取收藏的文章
     * @param collectionPerson  收藏者id
     * @return
     */
    List<Collection> findCollectionByCollectionPerson(@Param("collectionPerson") String collectionPerson);

    /**
     * 根据文章id和收藏者id获取收藏记录
     * @param articleId
     * @param collectionPerson
     * @return
     */
    Collection findCollectionByCollectionPersonAndArticleId(@Param("articleId")String articleId,@Param("collectionPerson") String collectionPerson);
}