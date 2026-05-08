package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.repository.TodoMapper;
import com.example.demo.dto.TodoForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;

@ExtendWith(MockitoExtension.class)
public class TodoServiceTest {

    @Mock
    private TodoMapper todoMapper;

    @InjectMocks
    private TodoService todoService;

    @Test
    @DisplayName("日課タスクを追加する際、期限と自動繰越が強制的に無効化されるか")
    void testAdd_DailyTask_ShouldClearDueDateAndCarryOver() {
        TodoForm form = new TodoForm();
        form.setTitle("筋トレ");
        form.setDaily(true);
        form.setDueDate(LocalDate.of(2025, 12, 31));
        form.setAutoCarryOver(true);

        doNothing().when(todoMapper).add(any(Todo.class));

        Todo result = todoService.add(form);

        assertEquals("筋トレ", result.getTitle());
        assertEquals(Status.INCOMPLETE, result.getStatus(), "ステータスがnullの場合はINCOMPLETE");
        assertTrue(result.getDaily(), "日課フラグはそのままON");
        assertNull(result.getDueDate(), "日課では強制的に日付はnull");
        assertFalse(result.getAutoCarryOver(), "日課なので自動繰越は強制機にfalse");

        verify(todoMapper, times(1)).add(any(Todo.class));
    }

    // ==========================================
    // オプション補正（adjustTaskOptions）のテスト
    // ==========================================

    @Test
    @DisplayName("日付タスクを追加する際、日課フラグが強制的に無効化されること")
    void testAdd_DueDateTask_ShouldDisableDaily() {
        TodoForm form = new TodoForm();
        form.setTitle("会議");
        form.setDueDate(LocalDate.of(2025, 12, 31)); // 日付あり
        form.setDaily(false); // 矛盾する日課設定
        form.setAutoCarryOver(true); // 繰越はONのまま活かされるべき

        doNothing().when(todoMapper).add(any(Todo.class));
        Todo result = todoService.add(form);

        assertFalse(result.getDaily(), "日付があるので日課フラグはfalseにされること");
        assertEquals(LocalDate.of(2025, 12, 31), result.getDueDate(), "日付はそのままセットされること");
        assertTrue(result.getAutoCarryOver(), "自動繰越の設定はそのまま活かされること");
    }

    @Test
    @DisplayName("プレーンタスクを追加する際、自動繰越が強制的に無効化されること")
    void testAdd_PlainTask_ShouldDisableCarryOver() {
        TodoForm form = new TodoForm();
        form.setTitle("買い物");
        form.setDueDate(null); // 日付なし
        form.setDaily(false); // 日課でもない
        form.setAutoCarryOver(true); // 矛盾する繰越設定

        doNothing().when(todoMapper).add(any(Todo.class));
        Todo result = todoService.add(form);

        assertFalse(result.getAutoCarryOver(), "日付がないので自動繰越はfalseにされること");
    }

    // ==========================================
    // 詰め替え処理（convertToEntity）のテスト
    // ==========================================

    @Test
    @DisplayName("ステータスが未指定(null)の場合、デフォルトでINCOMPLETEになること")
    void testAdd_StatusNull_ShouldSetIncomplete() {
        TodoForm form = new TodoForm();
        form.setTitle("ステータスなしタスク");
        form.setStatus(null); // わざとnullにする

        doNothing().when(todoMapper).add(any(Todo.class));
        Todo result = todoService.add(form);

        assertEquals(Status.INCOMPLETE, result.getStatus(), "nullの場合はINCOMPLETEになること");
    }

    @Test
    @DisplayName("ステータスが指定されている場合、そのままセットされること")
    void testAdd_StatusProvided_ShouldKeepStatus() {
        TodoForm form = new TodoForm();
        form.setTitle("完了済みタスク");
        form.setStatus(Status.DONE); // 明示的にDONEを指定

        doNothing().when(todoMapper).add(any(Todo.class));
        Todo result = todoService.add(form);

        assertEquals(Status.DONE, result.getStatus(), "指定されたステータスがそのままセットされること");
    }
}
