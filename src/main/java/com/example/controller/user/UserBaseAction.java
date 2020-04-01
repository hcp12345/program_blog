package com.example.controller.user;

import com.example.dao.UserMapper;
import com.example.dto.MessageBean;
import com.example.model.User;
import com.example.service.UserService;
import com.example.utils.CheckNull;
import com.example.utils.RandomUtil;
import com.example.utils.ResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotBlank;

/**
 *
 * @author hcp
 * @date 2020/3/6
 */
@RestController
@Validated
@RequestMapping("/user/base")
public class UserBaseAction {
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private UserService userService;

    /**
     * 获取用户信息
     * @param userId
     * @return
     */
    @RequestMapping(value = "getUser",method = RequestMethod.GET)
    public @ResponseBody
    MessageBean getUser(String userId){
        User user = userMapper.selectByPrimaryKey(userId);
        System.out.println(user);
        return ResultUtil.success(user);
    }

    /**
     * 登陆
     * @param mailboxOrName
     * @param passsword
     * @return
     */
    @RequestMapping(value = "/login.action",method = RequestMethod.POST)
    public @ResponseBody
    MessageBean login(@NotBlank(message = "账号不能为空") String mailboxOrName, @NotBlank(message = "密码不能为空") String passsword){
        User user1 = userMapper.selectUserByMailboxAndPassword(mailboxOrName,passsword);
        User user2 = userMapper.selectUserByNameAndPassword(mailboxOrName,passsword);
        if(!CheckNull.isObjectNull(user1)){
            return ResultUtil.success(user1);
        }else if(!CheckNull.isObjectNull(user2)){
            return ResultUtil.success(user2);
        }
        return ResultUtil.failureFront("账号或密码错误");
    }

    /**
     * 注册
     * @param mailbox
     * @param name
     * @param password
     * @return
     */
    @RequestMapping(value = "/register.action",method = RequestMethod.POST)
    public MessageBean register(@NotBlank(message = "邮箱不能为空")String mailbox,
                                @NotBlank(message = "用户名不能为空")String name,
                                @NotBlank(message = "密码不能为空")String password){
        if(!CheckNull.isObjectNull(userMapper.selectUserByMailbox(mailbox))){
            return ResultUtil.failure("此邮箱已被注册");
        }
        if(!CheckNull.isObjectNull(userMapper.selectUserByName(name))){
            return ResultUtil.failure("此账号名已被注册");
        }
        if(userService.registerUser(mailbox,name,password)){
            return ResultUtil.success("注册成功");           //返回注册成功页面
        }
        return ResultUtil.failure("注册失败");                       //返回注册页面 todo
    }

    /**
     * 验证邮箱是否激活成功
     * @param code  邮箱验证码
     * @return
     */
    @RequestMapping(value = "checkCode.action",method = RequestMethod.POST)
    public MessageBean checkCode(@NotBlank(message = "邮箱验证码不能为空") String code){
        if(userService.checkCode(code)){
            return ResultUtil.success("邮箱激活成功");
        }
        return ResultUtil.failure("邮箱激活失败");
    }

    /**
     * 更新用户信息
     * @param user
     * @return
     */
    @RequestMapping(value = "updateUser.action",method = RequestMethod.POST)
    public MessageBean updateUser(User user){
        if(!CheckNull.isObjectNull(user)){
            if(userMapper.updateByPrimaryKey(user) == 1){
                return ResultUtil.success("更新成功");
            }
            return ResultUtil.failure("更新失败");
        }
        return ResultUtil.failureFront("用户数据异常");
    }

    /**
     * 根据旧密码修改密码
     * @param userId
     * @param oldPwd
     * @param newPwd
     * @return
     */
    @RequestMapping(value = "updatePassword.action",method = RequestMethod.POST)
    public MessageBean updatePassword(@NotBlank(message = "用户id不能为空")String userId,
                                      @NotBlank(message = "旧密码不能为空")String oldPwd,
                                      @NotBlank(message = "新密码不能为空")String newPwd){
        User user = userMapper.selectByPrimaryKey(userId);
        if(user.getPassword().equals(oldPwd)){
            user.setPassword(newPwd);
            if(userMapper.updateByPrimaryKey(user) == 1){
                return ResultUtil.success();
            }
            return ResultUtil.failure();
        }
        return ResultUtil.failureFront("旧密码错误，请重新输入");
    }
}
