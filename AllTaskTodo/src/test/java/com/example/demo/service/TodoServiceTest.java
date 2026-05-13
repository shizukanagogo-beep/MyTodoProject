package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.repository.TodoMapper;
import com.example.demo.dto.TodoForm;
import com.example.demo.dto.TodoSortOrderForm;
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

    @Test
    @DisplayName("タスク追加時、並び順がそのままEntityにセットされること")
    void testAdd_ShouldKeepSortOrder() {
        TodoForm form = new TodoForm();
        form.setTitle("並び順つきタスク");
        form.setSortOrder(7);

        doNothing().when(todoMapper).add(any(Todo.class));

        Todo result = todoService.add(form);

        assertEquals(7, result.getSortOrder(), "sortOrderがEntityにセットされること");
    }

    @Test
    @DisplayName("タスク更新時、並び順がMapperに渡されること")
    void testUpdate_ShouldPassSortOrderToMapper() {
        TodoForm form = new TodoForm();
        form.setTitle("並び順更新タスク");
        form.setSortOrder(8);

        when(todoMapper.update(any(Todo.class))).thenReturn(true);

        boolean result = todoService.update(1, form);

        assertTrue(result, "更新成功を返すこと");
        verify(todoMapper).update(argThat(todo ->
                todo.getId().equals(1) && todo.getSortOrder().equals(8)));
    }

    @Test
    @DisplayName("並び順更新時、受け取ったIDと並び順を順番にMapperへ渡すこと")
    void testUpdateSortOrder_ShouldUpdateEachTodoSortOrder() {
        TodoSortOrderForm first = new TodoSortOrderForm();
        first.setId(3);
        first.setSortOrder(1);

        TodoSortOrderForm second = new TodoSortOrderForm();
        second.setId(1);
        second.setSortOrder(2);

        todoService.updateSortOrder(List.of(first, second));

        verify(todoMapper).updateSortOrder(3, 1);
        verify(todoMapper).updateSortOrder(1, 2);
    }

    @Test
    @DisplayName("期限超過時の挙動が0の場合、期限切れタスクを更新しないこと")
    void testApplyOverdueBehaviors_Behavior0_ShouldKeepOverdueDate() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(0, today.minusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper, never()).update(any(Todo.class));
        assertEquals(today.minusDays(1), todo.getDueDate(), "期限日は過去日のまま");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("期限超過時の挙動が1の場合、期限日を今日に繰り越すこと")
    void testApplyOverdueBehaviors_Behavior1_ShouldCarryDueDateToToday() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(1, today.minusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper).update(todo);
        assertEquals(today, todo.getDueDate(), "期限日が今日に更新されること");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("期限超過時の挙動が2の場合、自動的に完了済みにすること")
    void testApplyOverdueBehaviors_Behavior2_ShouldMarkDone() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(2, today.minusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper).update(todo);
        assertEquals(today.minusDays(1), todo.getDueDate(), "期限日は変更しないこと");
        assertEquals(Status.DONE, todo.getStatus(), "ステータスが完了済みになること");
    }

    @Test
    @DisplayName("期限超過時の挙動が3の場合、期限を未定に変更すること")
    void testApplyOverdueBehaviors_Behavior3_ShouldMarkDueDateUndecided() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(3, today.minusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper).update(todo);
        assertNull(todo.getDueDate(), "期限日が削除されること");
        assertEquals(true, todo.getDueDateUndecided(), "期限未定になること");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    private Todo createOverdueTodo(Integer overdueBehavior, LocalDate dueDate) {
        Todo todo = new Todo();
        todo.setId(1);
        todo.setTitle("期限切れタスク");
        todo.setStatus(Status.INCOMPLETE);
        todo.setDueDate(dueDate);
        todo.setOverdueBehavior(overdueBehavior);
        return todo;
    }
}
