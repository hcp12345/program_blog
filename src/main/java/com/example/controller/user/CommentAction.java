package com.example.controller.user;

import com.example.dao.CommentMapper;
import com.example.dto.MessageBean;
import com.example.model.Comment;
import com.example.service.CommentService;
import com.example.utils.CheckNull;
import com.example.utils.ResultUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.validation.constraints.NotBlank;
import java.util.List;

/**
 * Created by hcp on 2020/3/21.
 */
@RestController
@Validated
@RequestMapping("/user/comment")
public class CommentAction {
    @Autowired
    private CommentMapper commentMapper;
    @Autowired
    private CommentService commentService;

    /**
     * 发布评论       注：当评论对象为
     * @param comment
     * @return
     */
    @RequestMapping(value = "/createComment",method = RequestMethod.POST)
    public MessageBean createComment(Comment comment){
        if(CheckNull.isObjectNull(comment)){
            return ResultUtil.failureFront("前端数据异常");
        }
        if(commentService.addComment(comment)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }

    /**
     * 删除评论
     * @param commentId
     * @return
     */
    @RequestMapping(value = "deleteComment",method = RequestMethod.DELETE)
    public MessageBean deleteComment(@NotBlank(message = "评论id不能为空") String commentId){
        Comment comment = commentMapper.selectByPrimaryKey(commentId);
        if(!CheckNull.isObjectNull(comment)){
            if(commentService.delCommment(commentId)){
                return ResultUtil.success();
            }
            return ResultUtil.failure();
        }
        return ResultUtil.failureFront("前端数据异常");
    }

    /**
     * 点赞评论
     * @param commentId
     * @return
     */
    @RequestMapping(value = "addGoodForComment",method = RequestMethod.POST)
    public MessageBean addGoodForComment(@NotBlank(message = "评论id不能为空")String commentId,@NotBlank(message = "点赞者id不能为空")String userId){
        if(commentService.addGoodForComment(commentId,userId)){
            return ResultUtil.success();
        }
        return ResultUtil.failure();
    }

    /**
     * 获取1级评论列表
     * @param articleId
     * @return
     */
    @RequestMapping(value = "getFirstComment",method = RequestMethod.GET)
    public MessageBean getFirstComment(@NotBlank(message = "文章id不能为空")String articleId){
        List<Comment> comments = commentMapper.getFirstComments(articleId);
        return ResultUtil.success(comments);
    }


    /**
     * 获取2级评论列表
     * @param commentObject
     * @return
     */
    @RequestMapping(value = "getSecondComment",method = RequestMethod.GET)
    public MessageBean getSecondComment(@NotBlank(message = "父级评论不能为空")String commentObject){
        List<Comment> comments = commentMapper.getSecondComments(commentObject);
        return ResultUtil.success(comments);
    }


    /**
     * 通过评论id获取评论
     * @param commentId
     * @return
     */
    @RequestMapping(value = "getComment",method = RequestMethod.GET)
    public MessageBean getComment(@NotBlank(message = "评论id不能为空")String commentId){
        Comment comment = commentMapper.selectByPrimaryKey(commentId);
        return ResultUtil.success(comment);
    }


}
