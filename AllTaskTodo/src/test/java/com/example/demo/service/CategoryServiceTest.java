package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.CategorySortOrderForm;
import com.example.demo.entity.Category;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    @DisplayName("カテゴリ一覧取得時、Mapperの結果をそのまま返すこと")
    void testFindAll_ShouldReturnMapperResult() {
        Category first = new Category();
        first.setId(1);
        first.setName("仕事");
        first.setSortOrder(1);

        Category second = new Category();
        second.setId(2);
        second.setName("買い物");
        second.setSortOrder(2);

        List<Category> categories = List.of(first, second);

        when(categoryMapper.findAll()).thenReturn(categories);

        List<Category> result = categoryService.findAll();

        assertEquals(categories, result, "Mapperの結果をそのまま返すこと");
        verify(categoryMapper).findAll();
    }

    @Test
    @DisplayName("カテゴリ追加時、Mapperに渡したカテゴリを返すこと")
    void testAddCategory_ShouldReturnAddedCategory() {
        Category category = new Category();
        category.setName("仕事");
        category.setSortOrder(1);

        Category result = categoryService.addCategory(category);

        assertSame(category, result, "渡したカテゴリインスタンスをそのまま返すこと");
        verify(categoryMapper).addCategory(category);
    }

    @Test
    @DisplayName("カテゴリ更新時、IDをセットして更新し、更新後のカテゴリを返すこと")
    void testUpdateCategory_ShouldSetIdUpdateAndReturnUpdatedCategory() {
        Integer id = 1;

        Category request = new Category();
        request.setName("更新後カテゴリ");
        request.setSortOrder(5);

        Category updated = new Category();
        updated.setId(id);
        updated.setName("更新後カテゴリ");
        updated.setSortOrder(5);

        when(categoryMapper.findById(id)).thenReturn(updated);

        Category result = categoryService.updateCategory(id, request);

        assertEquals(updated, result, "更新後のカテゴリを返すこと");
        assertEquals(id, request.getId(), "更新対象IDがセットされること");
        verify(categoryMapper).updateCategory(request);
        verify(categoryMapper).findById(id);
    }

    @Test
    @DisplayName("カテゴリ削除時、サブタスク、親タスク、カテゴリの順に削除すること")
    void testDeleteCategory_ShouldDeleteSubTodosThenTodosThenCategory() {
        Integer categoryId = 1;
        Category category = new Category();
        category.setId(categoryId);

        when(categoryMapper.findById(categoryId)).thenReturn(category);

        categoryService.deleteCategory(categoryId);

        InOrder inOrder = inOrder(categoryMapper);
        inOrder.verify(categoryMapper).deleteSubTodosByCategoryId(categoryId);
        inOrder.verify(categoryMapper).deleteTodosByCategoryId(categoryId);
        inOrder.verify(categoryMapper).deleteCategory(categoryId);
    }

    @Test
    @DisplayName("存在しないカテゴリ削除時、ResourceNotFoundExceptionを投げること")
    void testDeleteCategory_NotFound_ShouldThrowException() {
        Integer categoryId = 999;

        when(categoryMapper.findById(categoryId)).thenReturn(null);

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.deleteCategory(categoryId));

        verify(categoryMapper, never()).deleteSubTodosByCategoryId(anyInt());
        verify(categoryMapper, never()).deleteTodosByCategoryId(anyInt());
        verify(categoryMapper, never()).deleteCategory(anyInt());
    }

    @Test
    @DisplayName("カテゴリ並び順更新時、受け取ったIDと並び順を順番にMapperへ渡すこと")
    void testUpdateSortOrder_ShouldUpdateEachCategorySortOrder() {
        CategorySortOrderForm first = new CategorySortOrderForm();
        first.setId(3);
        first.setSortOrder(1);

        CategorySortOrderForm second = new CategorySortOrderForm();
        second.setId(1);
        second.setSortOrder(2);

        when(categoryMapper.updateSortOrder(3, 1)).thenReturn(true);
        when(categoryMapper.updateSortOrder(1, 2)).thenReturn(true);

        categoryService.updateSortOrder(List.of(first, second));

        verify(categoryMapper).updateSortOrder(3, 1);
        verify(categoryMapper).updateSortOrder(1, 2);
    }
}
