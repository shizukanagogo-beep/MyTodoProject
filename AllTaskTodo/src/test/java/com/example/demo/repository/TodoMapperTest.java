package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mybatis.spring.boot.test.autoconfigure.MybatisTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ActiveProfiles;

import com.example.demo.dto.TodoForm;
import com.example.demo.entity.Todo;

@MybatisTest
@ActiveProfiles("test")
class TodoMapperTest {

    @Autowired
    private TodoMapper todoMapper;

    @Test
    @DisplayName("getList: sortOrder順で取得されること")
    void testGetList_ShouldOrderBySortOrder() {
        TodoForm form = new TodoForm();
        form.setCategoryId(4);

        List<Todo> result = todoMapper.getList(form);

        assertTrue(result.size() >= 2);

        assertEquals(2, result.get(0).getId());
        assertEquals(1, result.get(0).getSortOrder());

        assertEquals(1, result.get(1).getId());
        assertEquals(2, result.get(1).getSortOrder());
    }

    @Test
    @DisplayName("getList: existsDueDate=trueで日付ありと期限未定が取得されること")
    void testGetList_ExistsDueDate_ShouldReturnDueDateAndUndecidedTodos() {
        TodoForm form = new TodoForm();
        form.setExistsDueDate(true);

        List<Todo> result = todoMapper.getList(form);

        assertTrue(
                result.stream().anyMatch(todo -> Integer.valueOf(3).equals(todo.getId())),
                "日付ありタスクが含まれること");

        assertTrue(
                result.stream().anyMatch(todo -> Integer.valueOf(4).equals(todo.getId())),
                "期限未定タスクが含まれること");
    }

    @Test
    @DisplayName("getList: categoryUnassigned=trueでcategoryIdがnullのTodoが取得されること")
    void testGetList_CategoryUnassigned_ShouldReturnTodosWithoutCategory() {
        TodoForm form = new TodoForm();
        form.setCategoryUnassigned(true);

        List<Todo> result = todoMapper.getList(form);

        assertFalse(result.isEmpty());

        assertTrue(
                result.stream().allMatch(todo -> todo.getCategoryId() == null),
                "取得されたTodoはすべてcategoryIdがnullであること");

        assertTrue(
                result.stream().anyMatch(todo -> Integer.valueOf(5).equals(todo.getId())),
                "カテゴリなし親タスクが含まれること");

        assertTrue(
                result.stream().anyMatch(todo -> todo.getParentId() != null),
                "サブタスクも含まれること");
    }

    @Test
    @DisplayName("getList: parentId指定で子タスクが取得されること")
    void testGetList_ParentId_ShouldReturnSubtasks() {
        TodoForm form = new TodoForm();
        form.setParentId(6);

        List<Todo> result = todoMapper.getList(form);

        assertEquals(2, result.size());
        assertEquals(7, result.get(0).getId());
        assertEquals(1, result.get(0).getSortOrder());
        assertEquals(8, result.get(1).getId());
        assertEquals(2, result.get(1).getSortOrder());
    }
}