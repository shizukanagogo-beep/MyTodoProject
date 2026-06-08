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
    private static final Integer USER_ID = 1;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TodoMapper todoMapper;

    @Test
    @DisplayName("findAll: 他ユーザーのカテゴリは取得されないこと")
    void testFindAll_ShouldNotReturnOtherUserCategories() {
        List<Category> result = categoryMapper.findAll(USER_ID);

        assertTrue(
                result.stream().noneMatch(category -> Integer.valueOf(5).equals(category.getId())),
                "他ユーザーのカテゴリが含まれないこと");
    }

    @Test
    @DisplayName("findAll: sortOrder順でカテゴリ一覧を取得できること")
    void testFindAll_ShouldOrderBySortOrder() {
        List<Category> result = categoryMapper.findAll(USER_ID);

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
        categoryMapper.updateSortOrder(4, 1, USER_ID);

        Category result = categoryMapper.findById(4, USER_ID);

        assertEquals(4, result.getId());
        assertEquals(1, result.getSortOrder());
    }

    @Test
    @DisplayName("deleteSubTodosByCategoryId: 指定カテゴリ内の親タスクに紐づく子タスクを削除できること")
    void testDeleteSubTodosByCategoryId_ShouldDeleteChildrenOfCategoryTodos() {
        assertNotNull(todoMapper.getOne(7, USER_ID));
        assertNotNull(todoMapper.getOne(8, USER_ID));

        categoryMapper.deleteSubTodosByCategoryId(1, USER_ID);

        assertNull(todoMapper.getOne(7, USER_ID));
        assertNull(todoMapper.getOne(8, USER_ID));
        assertNotNull(todoMapper.getOne(6, USER_ID), "親タスク自体はまだ削除されないこと");
    }

    @Test
    @DisplayName("deleteTodosByCategoryId: 指定カテゴリ内の親タスクを削除できること")
    void testDeleteTodosByCategoryId_ShouldDeleteTodosInCategory() {
        assertNotNull(todoMapper.getOne(6, USER_ID));

        categoryMapper.deleteSubTodosByCategoryId(1, USER_ID);
        categoryMapper.deleteTodosByCategoryId(1, USER_ID);

        assertNull(todoMapper.getOne(6, USER_ID));
    }

    @Test
    @DisplayName("deleteCategory: 指定カテゴリを削除できること")
    void testDeleteCategory_ShouldDeleteCategory() {
        assertNotNull(categoryMapper.findById(3, USER_ID));

        categoryMapper.deleteCategory(3, USER_ID);

        assertNull(categoryMapper.findById(3, USER_ID));
    }
}
