package com.example.demo.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.TodoForm;
import com.example.demo.dto.TodoSortOrderForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;
import com.example.demo.exception.BadRequestException;
import com.example.demo.repository.CategoryMapper;
import com.example.demo.repository.TodoMapper;

@ExtendWith(MockitoExtension.class)
public class TodoServiceTest {

    @Mock
    private TodoMapper todoMapper;

    @Mock
    private CategoryMapper categoryMapper;

    private TodoService todoService;

    private final Clock fixedClock = Clock.fixed(
            Instant.parse("2026-05-12T00:00:00Z"),
            ZoneId.of("Asia/Tokyo"));

    @BeforeEach
    void setUp() {
        todoService = new TodoService(todoMapper, categoryMapper, fixedClock);
    }

    @Test
    @DisplayName("日課タスクに日付を同時指定した場合、例外になること")
    void testAdd_DailyTaskWithDueDate_ShouldThrowBadRequest() {
        TodoForm form = new TodoForm();
        form.setTitle("筋トレ");
        form.setDaily(true);
        form.setDueDate(LocalDate.of(2025, 12, 31));
        form.setAutoCarryOver(true);
        form.setDueDateUndecided(false);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> todoService.add(form));

        assertEquals("dailyタスクにはdueDateを指定できません", exception.getMessage());
        verify(todoMapper, never()).add(any(Todo.class));
    }

    @Test
    @DisplayName("日課タスクに期限未定を同時指定した場合、例外になること")
    void testAdd_DailyTaskWithDueDateUndecided_ShouldThrowBadRequest() {
        TodoForm form = new TodoForm();
        form.setTitle("筋トレ");
        form.setDaily(true);
        form.setDueDate(null);
        form.setAutoCarryOver(true);
        form.setDueDateUndecided(true);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> todoService.add(form));

        assertEquals("dailyタスクにはdueDateUndecidedを指定できません", exception.getMessage());
        verify(todoMapper, never()).add(any(Todo.class));
    }

    // ==========================================
    // オプション補正（adjustTaskOptions）のテスト
    // ==========================================

    @Test
    @DisplayName("日付タスクを追加する際、日課フラグが強制的に無効化されること")
    void testAdd_DueDateTask_ShouldDisableDaily() {
        TodoForm form = new TodoForm();
        form.setTitle("会議");
        form.setDueDate(LocalDate.of(2025, 12, 31));
        form.setDaily(false);
        form.setAutoCarryOver(true);

        doNothing().when(todoMapper).add(any(Todo.class));

        Todo result = todoService.add(form);

        assertFalse(result.getDaily(), "日付があるので日課フラグはfalseにされること");
        assertEquals(LocalDate.of(2025, 12, 31), result.getDueDate(), "日付はそのままセットされること");
        assertTrue(result.getAutoCarryOver(), "自動繰越の設定はそのまま活かされること");
    }

    @Test
    @DisplayName("期限未定タスクを追加する際、日付なしなら登録できること")
    void testAdd_DueDateUndecidedTaskWithoutDueDate_ShouldAdd() {
        TodoForm form = new TodoForm();
        form.setTitle("期限未定タスク");
        form.setDueDateUndecided(true);
        form.setDueDate(null);
        form.setDaily(false);
        form.setAutoCarryOver(true);

        doNothing().when(todoMapper).add(any(Todo.class));

        Todo result = todoService.add(form);

        assertTrue(result.getDueDateUndecided(), "期限未定フラグはtrueになること");
        assertNull(result.getDueDate(), "期限未定では日付はnullであること");
        assertFalse(result.getDaily(), "期限未定では日課はfalseになること");
        assertFalse(result.getAutoCarryOver(), "期限未定では自動繰越はfalseになること");

        verify(todoMapper, times(1)).add(any(Todo.class));
    }

    @Test
    @DisplayName("期限未定タスクに日付を同時指定した場合、例外になること")
    void testAdd_DueDateUndecidedTaskWithDueDate_ShouldThrowBadRequest() {
        TodoForm form = new TodoForm();
        form.setTitle("期限未定タスク");
        form.setDueDateUndecided(true);
        form.setDueDate(LocalDate.of(2026, 5, 12));
        form.setDaily(false);
        form.setAutoCarryOver(true);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> todoService.add(form));

        assertEquals("dueDateとdueDateUndecidedは同時指定できません", exception.getMessage());
        verify(todoMapper, never()).add(any(Todo.class));
    }

    @Test
    @DisplayName("日付と期限未定が同時に指定された場合、例外になること")
    void testAdd_DueDateAndUndecidedTask_ShouldThrowBadRequest() {
        TodoForm form = new TodoForm();
        form.setTitle("日付ありタスク");
        form.setDueDate(LocalDate.of(2026, 5, 12));
        form.setDueDateUndecided(true);
        form.setDaily(false);
        form.setAutoCarryOver(true);

        BadRequestException exception = assertThrows(
                BadRequestException.class,
                () -> todoService.add(form));

        assertEquals("dueDateとdueDateUndecidedは同時指定できません", exception.getMessage());
        verify(todoMapper, never()).add(any(Todo.class));
    }

    @Test
    @DisplayName("プレーンタスクを追加する際、自動繰越が強制的に無効化されること")
    void testAdd_PlainTask_ShouldDisableCarryOver() {
        TodoForm form = new TodoForm();
        form.setTitle("買い物");
        form.setDueDate(null);
        form.setDaily(false);
        form.setAutoCarryOver(true);

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
        form.setStatus(null);

        doNothing().when(todoMapper).add(any(Todo.class));

        Todo result = todoService.add(form);

        assertEquals(Status.INCOMPLETE, result.getStatus(), "nullの場合はINCOMPLETEになること");
    }

    @Test
    @DisplayName("ステータスが指定されている場合、そのままセットされること")
    void testAdd_StatusProvided_ShouldKeepStatus() {
        TodoForm form = new TodoForm();
        form.setTitle("完了済みタスク");
        form.setStatus(Status.DONE);

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

        Todo existingTodo = new Todo();
        existingTodo.setId(1);
        existingTodo.setDaily(false);

        when(todoMapper.getOne(1)).thenReturn(existingTodo);
        when(todoMapper.update(any(Todo.class))).thenReturn(true);

        boolean result = todoService.update(1, form);

        assertTrue(result, "更新成功を返すこと");
        verify(todoMapper).update(argThat(todo -> todo.getId().equals(1)
                && todo.getSortOrder().equals(8)));
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

        when(todoMapper.updateSortOrder(3, 1)).thenReturn(true);
        when(todoMapper.updateSortOrder(1, 2)).thenReturn(true);

        todoService.updateSortOrder(List.of(first, second));

        verify(todoMapper).updateSortOrder(3, 1);
        verify(todoMapper).updateSortOrder(1, 2);
    }

    @Test
    @DisplayName("タスク削除時、子タスクを先に削除してから対象タスクを削除すること")
    void testDelete_ShouldDeleteChildrenBeforeParent() {
        Integer id = 1;

        when(todoMapper.delete(id)).thenReturn(true);

        boolean result = todoService.delete(id);

        assertTrue(result, "親タスク削除の結果を返すこと");

        InOrder inOrder = inOrder(todoMapper);
        inOrder.verify(todoMapper).deleteByParentId(id);
        inOrder.verify(todoMapper).delete(id);
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
    @DisplayName("期限日が今日の場合、期限超過処理で更新しないこと")
    void testApplyOverdueBehaviors_DueDateToday_ShouldNotUpdate() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(1, today);

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper, never()).update(any(Todo.class));
        assertEquals(today, todo.getDueDate(), "期限日は今日のまま");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("期限日が未来の場合、期限超過処理で更新しないこと")
    void testApplyOverdueBehaviors_FutureDueDate_ShouldNotUpdate() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(1, today.plusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper, never()).update(any(Todo.class));
        assertEquals(today.plusDays(1), todo.getDueDate(), "期限日は未来日のまま");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("期限日が未設定の場合、期限超過処理で更新しないこと")
    void testApplyOverdueBehaviors_DueDateNull_ShouldNotUpdate() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(1, null);

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper, never()).update(any(Todo.class));
        assertNull(todo.getDueDate(), "期限日は未設定のまま");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("期限超過時の挙動が未設定の場合、期限超過処理で更新しないこと")
    void testApplyOverdueBehaviors_BehaviorNull_ShouldNotUpdate() {
        LocalDate today = LocalDate.of(2026, 5, 12);
        Todo todo = createOverdueTodo(null, today.minusDays(1));

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of(todo));

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper, never()).update(any(Todo.class));
        assertEquals(today.minusDays(1), todo.getDueDate(), "期限日は過去日のまま");
        assertEquals(Status.INCOMPLETE, todo.getStatus(), "ステータスは未完了のまま");
    }

    @Test
    @DisplayName("完了済みタスクは期限超過処理の取得対象に含めないこと")
    void testApplyOverdueBehaviors_ShouldFetchOnlyIncompleteTodos() {
        LocalDate today = LocalDate.of(2026, 5, 12);

        when(todoMapper.getList(any(TodoForm.class))).thenReturn(List.of());

        todoService.applyOverdueBehaviors(today);

        verify(todoMapper).getList(argThat(form -> form.getStatus() == Status.INCOMPLETE));
        verify(todoMapper, never()).update(any(Todo.class));
    }

    @Test
    @DisplayName("一覧取得時、Clockで固定した今日の日付を使って期限超過タスクを処理すること")
    void testGetList_ShouldApplyOverdueBehaviorsUsingInjectedClock() {
        TodoForm condition = new TodoForm();
        LocalDate fixedToday = LocalDate.of(2026, 5, 12);
        Todo overdueTodo = createOverdueTodo(1, fixedToday.minusDays(1));
        Todo listedTodo = createOverdueTodo(1, fixedToday);

        when(todoMapper.getList(any(TodoForm.class)))
                .thenReturn(List.of(overdueTodo))
                .thenReturn(List.of(listedTodo));

        List<Todo> result = todoService.getList(condition);

        InOrder inOrder = inOrder(todoMapper);
        inOrder.verify(todoMapper).resetDailyTasks();
        inOrder.verify(todoMapper).getList(argThat(form -> form.getStatus() == Status.INCOMPLETE));
        inOrder.verify(todoMapper).update(overdueTodo);
        inOrder.verify(todoMapper).getList(condition);

        assertEquals(fixedToday, overdueTodo.getDueDate(), "Clockで固定した日付に繰り越されること");
        assertEquals(List.of(listedTodo), result, "一覧取得結果を返すこと");
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
