package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Category;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.CategoryForm;
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
    public Category addCategory(CategoryForm form) {
        Category category = convertToEntity(form);
        categoryMapper.addCategory(category);
        return category;
    }

    // -------------------------------------------------------------
    public Category updateCategory(Integer id, CategoryForm form) {
        if (categoryMapper.findById(id) == null) {
            throw new ResourceNotFoundException("Category not found");
        }
        Category category = convertToEntity(form);
        category.setId(id);
        categoryMapper.updateCategory(category);
        return categoryMapper.findById(id);
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

    // -----------------------------------------------------------------------
    private Category convertToEntity(CategoryForm form) {
        Category category = new Category();
        category.setName(form.getName());
        category.setSortOrder(form.getSortOrder());
        return category;
    }

}
