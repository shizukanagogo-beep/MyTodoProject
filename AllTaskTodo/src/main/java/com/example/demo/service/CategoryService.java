package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Category;
import com.example.demo.repository.CategoryMapper;

@Service
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryMapper categoryMapper) {
        this.categoryMapper = categoryMapper;
    }

    // -----------------------------------------------------------
    public List<Category> findAll() {
        return categoryMapper.findAll();
    }

    // ------------------------------------------------------------
    public Category addCategory(Category category) {
        categoryMapper.addCategory(category);
        return category;
    }

    // -------------------------------------------------------------
    public Category updateCategory(Integer id, Category category) {
        category.setId(id);
        categoryMapper.updateCategory(category);
        return categoryMapper.findById(id);
    }

    // -------------------------------------------------------------
    public void deleteCategory(Integer id) {
        categoryMapper.deleteTodosByCategoryId(id);
        categoryMapper.deleteCategory(id);
    }

}
