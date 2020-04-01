package com.example.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notice {
    private String noticeId;

    private String noticeTag;

    private String notice;

    private String noticePerson;

    private String userId;

    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss",timezone = "GMT+8")
    private LocalDateTime noticeDate;

    private String noticeType;

    private String targetId;

    public String getNoticeId() {
        return noticeId;
    }

    public void setNoticeId(String noticeId) {
        this.noticeId = noticeId == null ? null : noticeId.trim();
    }

    public String getNoticeTag() {
        return noticeTag;
    }

    public void setNoticeTag(String noticeTag) {
        this.noticeTag = noticeTag == null ? null : noticeTag.trim();
    }

    public String getNotice() {
        return notice;
    }

    public void setNotice(String notice) {
        this.notice = notice == null ? null : notice.trim();
    }

    public String getNoticePerson() {
        return noticePerson;
    }

    public void setNoticePerson(String noticePerson) {
        this.noticePerson = noticePerson == null ? null : noticePerson.trim();
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId == null ? null : userId.trim();
    }

    public LocalDateTime getNoticeDate() {
        return noticeDate;
    }

    public void setNoticeDate(LocalDateTime noticeDate) {
        this.noticeDate = noticeDate;
    }

    public String getNoticeType() {
        return noticeType;
    }

    public void setNoticeType(String noticeType) {
        this.noticeType = noticeType == null ? null : noticeType.trim();
    }

    public String getTargetId() {
        return targetId;
    }

    public void setTargetId(String targetId) {
        this.targetId = targetId == null ? null : targetId.trim();
    }
}