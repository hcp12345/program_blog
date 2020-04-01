package com.example.service;

import com.example.model.Collection;

/**
 * Created by hcp on 2020/3/22.
 */
public interface CollectionService {

    /**
     * 收藏文章
     * @param collection
     * @return
     */
    Boolean addCollection(Collection collection);
}
