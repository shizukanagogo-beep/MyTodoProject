package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;

import com.example.demo.entity.Category;

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
class CategoryMapperTest {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TodoMapper todoMapper;

    @Test
    @DisplayName("findAll: sortOrder順でカテゴリ一覧を取得できること")
    void testFindAll_ShouldOrderBySortOrder() {
        List<Category> result = categoryMapper.findAll();

        assertEquals(4, result.size());

        assertEquals(1, result.get(0).getId());
        assertEquals(1, result.get(0).getSortOrder());

        assertEquals(2, result.get(1).getId());
        assertEquals(2, result.get(1).getSortOrder());

        assertEquals(3, result.get(2).getId());
        assertEquals(3, result.get(2).getSortOrder());

        assertEquals(4, result.get(3).getId());
        assertEquals(4, result.get(3).getSortOrder());
    }

    @Test
    @DisplayName("updateSortOrder: 指定カテゴリのsortOrderを更新できること")
    void testUpdateSortOrder_ShouldUpdateCategorySortOrder() {
        categoryMapper.updateSortOrder(4, 1);

        Category result = categoryMapper.findById(4);

        assertEquals(4, result.getId());
        assertEquals(1, result.getSortOrder());
    }

    @Test
    @DisplayName("deleteSubTodosByCategoryId: 指定カテゴリ内の親タスクに紐づく子タスクを削除できること")
    void testDeleteSubTodosByCategoryId_ShouldDeleteChildrenOfCategoryTodos() {
        assertNotNull(todoMapper.getOne(7));
        assertNotNull(todoMapper.getOne(8));

        categoryMapper.deleteSubTodosByCategoryId(1);

        assertNull(todoMapper.getOne(7));
        assertNull(todoMapper.getOne(8));
        assertNotNull(todoMapper.getOne(6), "親タスク自体はまだ削除されないこと");
    }

    @Test
    @DisplayName("deleteTodosByCategoryId: 指定カテゴリ内の親タスクを削除できること")
    void testDeleteTodosByCategoryId_ShouldDeleteTodosInCategory() {
        assertNotNull(todoMapper.getOne(6));

        categoryMapper.deleteSubTodosByCategoryId(1);
        categoryMapper.deleteTodosByCategoryId(1);

        assertNull(todoMapper.getOne(6));
    }

    @Test
    @DisplayName("deleteCategory: 指定カテゴリを削除できること")
    void testDeleteCategory_ShouldDeleteCategory() {
        assertNotNull(categoryMapper.findById(3));

        categoryMapper.deleteCategory(3);

        assertNull(categoryMapper.findById(3));
    }
}