package com.example.demo.repository;

import java.util.List;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.entity.Category;

@Mapper
public interface CategoryMapper {
    List<Category> findAll(Integer userId);

    void addCategory(Category category);

    Integer findMaxSortOrder(Integer userId);

    void updateCategory(Category category);

    Category findById(@Param("id") Integer id, @Param("userId") Integer userId);

    void deleteSubTodosByCategoryId(@Param("categoryId") Integer categoryId, @Param("userId") Integer userId);

    void deleteTodosByCategoryId(@Param("categoryId") Integer categoryId, @Param("userId") Integer userId);

    void deleteCategory(@Param("id") Integer id, @Param("userId") Integer userId);

    boolean updateSortOrder(@Param("id") Integer id, @Param("sortOrder") Integer sortOrder,
            @Param("userId") Integer userId);

}
