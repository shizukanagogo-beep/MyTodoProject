package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.security.test.context.support.WithMockUser;

import com.example.demo.dto.CategoryForm;
import com.example.demo.entity.Category;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;
import com.example.demo.repository.TodoMapper;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:alltask_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.sql.init.mode=never"
})
@Sql(scripts = {
        "classpath:schema-test.sql",
        "classpath:data-test.sql"
})
@WithMockUser(username = "test")
class CategoryServiceTest {
    private static final Integer USER_ID = 1;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TodoMapper todoMapper;

    @Test
    @DisplayName("カテゴリ作成時、sortOrderが自動採番されること")
    void testAddCategory_ShouldAssignSortOrder() {
        CategoryForm form = new CategoryForm();
        form.setName("新規カテゴリ");
        form.setSortOrder(null);

        Category result = categoryService.addCategory(form);

        assertNotNull(result.getId());
        assertEquals("新規カテゴリ", result.getName());
        assertEquals(5, result.getSortOrder());
        assertEquals(5, categoryMapper.findById(result.getId(), USER_ID).getSortOrder());
    }

    @Test
    @DisplayName("存在しないカテゴリ更新時、ResourceNotFoundExceptionになること")
    void testUpdateCategory_NotFound_ShouldThrowException() {
        CategoryForm form = new CategoryForm();
        form.setName("存在しないカテゴリ");
        form.setSortOrder(1);

        assertThrows(
                ResourceNotFoundException.class,
                () -> categoryService.updateCategory(999, form));
    }

    @Test
    @DisplayName("カテゴリ削除時、対象カテゴリのTodoとSubTodoも削除されること")
    void testDeleteCategory_ShouldDeleteTodosAndSubTodos() {
        assertNotNull(categoryMapper.findById(1, USER_ID));
        assertNotNull(todoMapper.getOne(6, USER_ID));
        assertNotNull(todoMapper.getOne(7, USER_ID));
        assertNotNull(todoMapper.getOne(8, USER_ID));

        categoryService.deleteCategory(1);

        assertNull(todoMapper.getOne(6, USER_ID));
        assertNull(todoMapper.getOne(7, USER_ID));
        assertNull(todoMapper.getOne(8, USER_ID));
        assertNull(categoryMapper.findById(1, USER_ID));
    }
}
