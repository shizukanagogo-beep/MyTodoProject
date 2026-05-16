package com.example.demo.repository;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.entity.Category;

@Mapper
public interface CategoryMapper {
    List<Category> findAll();

    void addCategory(Category category);

    void updateCategory(Category category);

    Category findById(Integer id);

    void deleteSubTodosByCategoryId(Integer categoryId);

    void deleteTodosByCategoryId(Integer categoryId);

    void deleteCategory(Integer id);

    boolean updateSortOrder(@Param("id") Integer id, @Param("sortOrder") Integer sortOrder);

}
