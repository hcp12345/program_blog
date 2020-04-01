package com.example.controller.user;

import com.example.dao.NoticeMapper;
import com.example.dto.MessageBean;
import com.example.model.Notice;
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
@RequestMapping("/user/notice")
public class NoticeAction {
    @Autowired
    private NoticeMapper noticeMapper;

    /**
     * 获取本人所有通知
     * @param userId
     * @return
     */
    @RequestMapping(value = "/getNoticeByUser",method = RequestMethod.GET)
    public MessageBean getNoticeByUser(@NotBlank(message = "用户id不能为空")String userId){
        List<Notice> notices = noticeMapper.getNoticeByNoticePerson(userId);
        return ResultUtil.success(notices);
    }

    /**
     * 通过noticeId获取通知
     * @param noticeId
     * @return
     */
    @RequestMapping(value = "/getNoticeByNoticeId",method = RequestMethod.GET)
    public MessageBean getNoticeByNoticeId(@NotBlank(message = "通知id不能为空")String noticeId){
        Notice notice = noticeMapper.selectByPrimaryKey(noticeId);
        return ResultUtil.success(notice);
    }

}
