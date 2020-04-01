package com.example.dao;

import com.example.model.User;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserMapper {
    int deleteByPrimaryKey(String userId);

    int insert(User record);

    int insertSelective(User record);

    User selectByPrimaryKey(String userId);

    int updateByPrimaryKeySelective(User record);

    int updateByPrimaryKey(User record);

    /**
     * 通过用户名和密码查询用户
     * @param name
     * @param password
     * @return
     */
    User selectUserByNameAndPassword(@Param("name")String name, @Param("password")String password);

    /**
     * 通过邮箱和密码查询用户
     * @param mailbox
     * @param password
     * @return
     */
    User selectUserByMailboxAndPassword(@Param("mailbox")String mailbox, @Param("password")String password);

    /**
     * 通过用户名查询用户
     * @param name
     * @return
     */
    User selectUserByName(@Param("name")String name);

    /**
     * 通过邮箱查询用户
     * @param mailbox
     * @return
     */
    User selectUserByMailbox(@Param("mailbox")String mailbox);

    /**
     * 根据邮箱验证码获取用户
     * @param code
     * @return
     */
    User getUserByCode(@Param("code")String code);

}