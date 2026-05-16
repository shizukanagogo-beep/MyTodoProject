package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Category;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.dto.CategorySortOrderForm;

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
        Category updatedCategory = categoryMapper.findById(id);
        if (updatedCategory == null) {
            throw new ResourceNotFoundException("Category not found");
        }
        return updatedCategory;
    }

    // -------------------------------------------------------------
    public void deleteCategory(Integer id) {
        if (categoryMapper.findById(id) == null) {
            throw new ResourceNotFoundException("Category not found");
        }
        categoryMapper.deleteSubTodosByCategoryId(id);
        categoryMapper.deleteTodosByCategoryId(id);
        categoryMapper.deleteCategory(id);
    }

    // ---------------------------------------------------------------
    @Transactional
    public void updateSortOrder(List<CategorySortOrderForm> forms) {
        for (CategorySortOrderForm form : forms) {
            boolean updated = categoryMapper.updateSortOrder(form.getId(), form.getSortOrder());
            if (!updated) {
                throw new ResourceNotFoundException("Category not found");
            }
        }
    }

}
