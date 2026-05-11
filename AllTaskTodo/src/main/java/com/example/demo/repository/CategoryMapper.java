package com.example.demo.repository;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import com.example.demo.entity.Category;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();

    void addCategory(Category category);

    void updateCategory(Category category);

    Category findById(int id);

    void deleteTodosByCategoryId(Integer categoryId);

    void deleteCategory(Integer id);

}
