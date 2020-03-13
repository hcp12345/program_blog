package com.example;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

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

}
