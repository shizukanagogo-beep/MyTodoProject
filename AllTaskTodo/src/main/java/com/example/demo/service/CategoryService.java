package com.example.demo.service;

import java.util.List;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Category;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;
import com.example.demo.security.CurrentUserService;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.CategoryForm;
import com.example.demo.dto.CategorySortOrderForm;

@Service
public class CategoryService {
    private final CategoryMapper categoryMapper;
    private final CurrentUserService currentUserService;

    public CategoryService(CategoryMapper categoryMapper, CurrentUserService currentUserService) {
        this.categoryMapper = categoryMapper;
        this.currentUserService = currentUserService;
    }

    // -----------------------------------------------------------
    public List<Category> findAll() {
        return categoryMapper.findAll(currentUserService.getCurrentUserId());
    }

    // ------------------------------------------------------------
    public Category addCategory(CategoryForm form) {
        Integer userId = currentUserService.getCurrentUserId();
        assignSortOrderIfNeeded(form, userId);

        Category category = convertToEntity(form);
        category.setUserId(userId);
        categoryMapper.addCategory(category);
        return category;
    }

    // -------------------------------------------------------------
    public Category updateCategory(Integer id, CategoryForm form) {
        Integer userId = currentUserService.getCurrentUserId();
        if (categoryMapper.findById(id, userId) == null) {
            throw new ResourceNotFoundException("Category not found");
        }
        Category category = convertToEntity(form);
        category.setId(id);
        category.setUserId(userId);
        categoryMapper.updateCategory(category);
        return categoryMapper.findById(id, userId);
    }

    // -------------------------------------------------------------
    @Transactional
    public void deleteCategory(Integer id) {
        Integer userId = currentUserService.getCurrentUserId();
        if (categoryMapper.findById(id, userId) == null) {
            throw new ResourceNotFoundException("Category not found");
        }
        categoryMapper.deleteSubTodosByCategoryId(id, userId);
        categoryMapper.deleteTodosByCategoryId(id, userId);
        categoryMapper.deleteCategory(id, userId);
    }

    // ---------------------------------------------------------------
    @Transactional
    public void updateSortOrder(List<CategorySortOrderForm> forms) {
        Integer userId = currentUserService.getCurrentUserId();
        for (CategorySortOrderForm form : forms) {
            boolean updated = categoryMapper.updateSortOrder(form.getId(), form.getSortOrder(), userId);
            if (!updated) {
                throw new ResourceNotFoundException("Category not found");
            }
        }
    }

    private void assignSortOrderIfNeeded(CategoryForm form, Integer userId) {
        if (form.getSortOrder() != null) {
            return;
        }

        Integer maxSortOrder = categoryMapper.findMaxSortOrder(userId);
        form.setSortOrder(maxSortOrder == null ? 1 : maxSortOrder + 1);
    }

    // -----------------------------------------------------------------------
    private Category convertToEntity(CategoryForm form) {
        Category category = new Category();
        category.setName(form.getName());
        category.setSortOrder(form.getSortOrder());
        return category;
    }

}
