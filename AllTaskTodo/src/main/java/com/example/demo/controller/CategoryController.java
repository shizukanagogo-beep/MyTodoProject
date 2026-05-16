package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.entity.Category;
import com.example.demo.service.CategoryService;
import org.springframework.web.bind.annotation.PatchMapping;

import com.example.demo.dto.CategoryForm;
import com.example.demo.dto.CategorySortOrderForm;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;

@RequiredArgsConstructor
@RestController
@RequestMapping("/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private final CategoryService categoryService;

    // -----------------------------------------------------------
    @GetMapping
    public List<Category> findAll() {
        return categoryService.findAll();
    }

    // -----------------------------------------------------
    @PostMapping
    public Category addCategory(@RequestBody CategoryForm form) {
        return categoryService.addCategory(form);
    }

    // -----------------------------------------------------==
    @PutMapping("/{id}")
    public Category updateCategory(
            @PathVariable Integer id,
            @RequestBody CategoryForm form) {
        return categoryService.updateCategory(id, form);
    }

    // ------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Integer id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    // ---------------------------------------------------------------
    @PatchMapping("/sort-order")
    public void updateSortOrder(@RequestBody List<CategorySortOrderForm> forms) {
        categoryService.updateSortOrder(forms);
    }
}
