package com.example.controller.User;

import com.example.dao.UserMapper;
import com.example.dto.MessageBean;
import com.example.model.User;
import com.example.utils.ResultUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

/**
 * Created by hcp on 2020/3/6.
 */
@Controller
@RequestMapping("/user")
public class UserAction {
    @Autowired
    private UserMapper userMapper;

    @RequestMapping(value = "getUser",method = RequestMethod.GET)
    public @ResponseBody
    MessageBean getUser(String userId){
        User user = userMapper.selectByPrimaryKey(userId);
        System.out.println(user);
        return ResultUtils.success();
    }
}
