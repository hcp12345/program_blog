package com.example;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.test.context.junit4.SpringRunner;

import javax.mail.internet.MimeMessage;
import java.io.File;

@RunWith(SpringRunner.class)
@SpringBootTest
public class ProgramBlogApplicationTests {
	private static final Logger log = LoggerFactory.getLogger(ProgramBlogApplication.class);

	@Test
	public void contextLoads() {
	}

	@Test
	public void test(){
		log.warn("Something else is wrong here");
		log.debug("Something else is wrong here");
		log.info("Something else is wrong here");
		log.error("Something else is wrong here");
		log.trace("Something else is wrong here");
		System.out.println(log.isDebugEnabled());

	}

	@Autowired
	JavaMailSenderImpl mailSender;
	@Test
	public void test2() throws Exception{
		MimeMessage mimeMessage = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage,true);
		helper.setSubject("今晚开会了");
		helper.setText("大家，好！<br> &nbsp;&nbsp;<b style='color:red'>今晚7:30在教学楼201开班委会，请各位班委准时参加！</b> <br>谢谢！",true);
		helper.setTo("2934819354@qq.com");
		helper.setFrom("3132857267@qq.com");

		//添加附件
		helper.addAttachment("会议说明.txt",new File("C:\\Users\\hcp\\Desktop\\img\\捕获.PNG"));
		helper.addAttachment("会议图片.jpg",new File("C:\\Users\\hcp\\Desktop\\文件\\ceshi.txt"));

		mailSender.send(mimeMessage);
	}

}
