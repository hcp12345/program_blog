package com.example.service.impl;

import com.example.dao.CollectionMapper;
import com.example.dao.NoticeMapper;
import com.example.dao.UserMapper;
import com.example.model.Collection;
import com.example.model.Notice;
import com.example.model.User;
import com.example.service.CollectionService;
import com.example.utils.RandomUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * Created by hcp on 2020/3/22.
 */
@Service
public class CollectionServiceImpl implements CollectionService {
    @Autowired
    private CollectionMapper collectionMapper;
    @Autowired
    private NoticeMapper noticeMapper;
    @Autowired
    private UserMapper userMapper;


    @Override
    @Transactional
    public Boolean addCollection(Collection collection) {
        collection.setCollectionId(RandomUtil.getUUID());
        collection.setCollectionDate(LocalDateTime.now());
        if(collectionMapper.updateByPrimaryKey(collection) == 0){
            return false;
        }
        //收藏成功
        User user = userMapper.selectByPrimaryKey(collection.getCollectionPerson()); //收藏者信息
        // 插入一条收藏通知，告知作者
        Notice notice = new Notice();
        notice.setNotice(RandomUtil.getUUID());
        notice.setNotice(user.getName()+"收藏了您的文章");
        notice.setNoticePerson(collection.getUserId());               //被通知者（文章作者）
        notice.setUserId(user.getUserId());                           //操作者(进行收藏的人)
        notice.setNoticeDate(LocalDateTime.now());
        notice.setNoticeType("1");
        notice.setTargetId(collection.getArticleId());
        if(noticeMapper.insert(notice) == 0){
            return false;
        }
        return true;
    }
}
