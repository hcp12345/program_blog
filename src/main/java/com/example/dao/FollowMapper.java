package com.example.dao;

import com.example.model.Follow;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FollowMapper {
    int deleteByPrimaryKey(String followId);

    int insert(Follow record);

    int insertSelective(Follow record);

    Follow selectByPrimaryKey(String followId);

    int updateByPrimaryKeySelective(Follow record);

    int updateByPrimaryKey(Follow record);

    /**
     * 根据followPerson获取关注数据
     * @param followPerson  关注者（进行关注操作的人）
     * @return
     */
    List<Follow> getFollowByNoticePerson(@Param("followPerson")String followPerson);

    /**
     * 根据userId获取关注数据
     * @param userId
     * @return
     */
    List<Follow> getFollowByUserId(@Param("userId")String userId);
}