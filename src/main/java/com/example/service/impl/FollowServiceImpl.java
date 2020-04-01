package com.example.service.impl;

import com.example.dao.FollowMapper;
import com.example.dao.NoticeMapper;
import com.example.dao.UserMapper;
import com.example.model.Follow;
import com.example.model.Notice;
import com.example.model.User;
import com.example.service.FollowService;
import com.example.utils.RandomUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 *
 * @author hcp
 * @date 2020/3/22
 */
@Service
public class FollowServiceImpl implements FollowService{
    @Autowired
    private FollowMapper followMapper;
    @Autowired
    private NoticeMapper noticeMapper;
    @Autowired
    private UserMapper userMapper;

    @Override
    @Transactional
    public Boolean addFollow(String followPerson, String userId) {
        Follow follow = new Follow();
        follow.setFollowId(RandomUtil.getUUID());
        follow.setFollowPerson(followPerson);
        follow.setUserId(userId);
        follow.setFollowDate(LocalDateTime.now());
        if(followMapper.insert(follow) == 1){             //插入关注记录
            Notice notice = new Notice();
            notice.setNotice(RandomUtil.getUUID());
            notice.setNotice(followPerson+"关注了您");
            notice.setNoticePerson(userId);               //被通知者
            notice.setUserId(followPerson);               //操作者
            notice.setNoticeDate(LocalDateTime.now());
            notice.setNoticeType("0");
            notice.setTargetId(followPerson);
            if(noticeMapper.insert(notice) == 1){       //插入通知记录
                User user = userMapper.selectByPrimaryKey(userId);
                user.setFollows(user.getFollows()+1);
                if(userMapper.updateByPrimaryKey(user) == 1){       //更新被通知者关注人数
                    return true;
                }
                return false;
            }else {
                return false;
            }
        }else {
            return false;
        }
    }

    @Override
    @Transactional
    public Boolean delFollow(String followId) {
        Follow follow = followMapper.selectByPrimaryKey(followId);
        User user = userMapper.selectByPrimaryKey(follow.getUserId());
        if(followMapper.deleteByPrimaryKey(followId) == 1){
            user.setFollows(user.getFollows()-1);
            if(userMapper.updateByPrimaryKey(user) == 1){
                return true;
            }
            return false;
        }
        return false;
    }

    @Override
    @Transactional
    public List<User> getPersonByFollow(String userId) {
        List<Follow> follows = followMapper.getFollowByNoticePerson(userId);
        List<User> users = new ArrayList<>();
        for (Follow f:follows){
            User user = userMapper.selectByPrimaryKey(f.getUserId());
            users.add(user);
        }
        return users;
    }

    @Override
    @Transactional
    public List<User> getPersonByUser(String userId) {
        List<Follow> follows = followMapper.getFollowByUserId(userId);
        List<User> users = new ArrayList<>();
        for (Follow f:follows){
            User user = userMapper.selectByPrimaryKey(f.getUserId());
            users.add(user);
        }
        return users;
    }


}
