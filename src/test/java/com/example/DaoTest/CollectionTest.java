package com.example.DaoTest;

import com.example.ProgramBlogApplicationTests;
import com.example.dao.CollectionMapper;
import com.example.model.Collection;
import org.junit.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;

/**
 * Created by hcp on 2020/3/21.
 */
public class CollectionTest extends ProgramBlogApplicationTests {
    @Autowired
    private CollectionMapper collectionMapper;

    @Test
    public void testSelect(){
        List<Collection> collections = collectionMapper.findCollectionByCollectionPerson("2");
        for (Collection c:collections){
            System.out.println(c);
        }
    }
}
