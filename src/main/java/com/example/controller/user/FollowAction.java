package com.example.controller.user;

import com.example.dao.FollowMapper;
import com.example.dao.NoticeMapper;
import com.example.dto.MessageBean;
import com.example.model.User;
import com.example.service.FollowService;
import com.example.utils.ResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * Created by hcp on 2020/3/22.
 */
@RestController
@Validated
@RequestMapping("/user/follow")
public class FollowAction {
    @Autowired
    private FollowMapper followMapper;
    @Autowired
    private NoticeMapper noticeMapper;
    @Autowired
    private FollowService followService;


    /**
     * 添加关注
     * @param followPerson
     * @param userId
     * @return
     */
    @RequestMapping(value = "addFollow.action",method = RequestMethod.POST)
    public MessageBean addFollow(@NotBlank(message = "关注者id不能为空") String followPerson, @NotBlank(message = "被关注者id不能为空") String userId){
        if(followService.addFollow(followPerson,userId)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }

    /**
     * 取消关注
     * @param followId      可以改为followPerson+userId
     * @return
     */
    @RequestMapping(value = "delFollow.action",method = RequestMethod.DELETE)
    public MessageBean delFollow(@NotBlank(message = "关注id不能为空")String followId){
        if(followService.delFollow(followId)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }

    /**
     * 获取我关注的人
     * @param userId  我
     * @return
     */
    @RequestMapping(value = "getFollowPersons.action",method = RequestMethod.GET)
    public MessageBean getFollowPersons(@NotBlank(message = "用户id不能为空")String userId){
        List<User> users = followService.getPersonByFollow(userId);
        return ResultUtil.success(users);
    }

}
