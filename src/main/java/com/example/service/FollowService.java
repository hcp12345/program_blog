package com.example.service;

import com.example.model.User;

import java.util.List;

/**
 * Created by hcp on 2020/3/22.
 */
public interface FollowService {

    /**
     * 点击关注
     * @param followPerson
     * @param userId
     * @return
     */
    Boolean addFollow(String followPerson,String userId);

    /**
     * 取消关注
     * @param followId
     * @return
     */
    Boolean delFollow(String followId);

    /**
     * 获取我关注的人
     * @param userId
     * @return
     */
    List<User> getPersonByFollow(String userId);

    /**
     * 获取关注了我的人
     * @param userId
     * @return
     */
    List<User> getPersonByUser(String userId);
}
