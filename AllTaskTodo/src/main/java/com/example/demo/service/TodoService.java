package com.example.demo.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.TodoForm;
import com.example.demo.dto.TodoSortOrderForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.CategoryMapper;
import com.example.demo.repository.TodoMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TodoService {
    private final TodoMapper todoMapper;
    private final CategoryMapper categoryMapper;
    private final Clock clock;

    // 全件取得（日課リセット・繰り越し処理を含む）-------------------------------------------------------
    @Transactional
    public List<Todo> getList(TodoForm condition) {
        LocalDate today = LocalDate.now(clock);

        // 既存の定時バッチ的な処理
        todoMapper.resetDailyTasks();
        applyOverdueBehaviors(today);
        // 万能DTO（TodoForm）をそのままMapperに渡して検索
        return todoMapper.getList(condition);
    }

    // 新規追加-------------------------------------------------------------------------------
    public Todo add(TodoForm form) {
        validateBusinessRules(null, form);
        adjustTaskOptions(form);
        assignSortOrderIfNeeded(form);

        Todo todo = convertToEntity(form);
        // DBへ登録（MyBatisによりIDがセットされる）
        todoMapper.add(todo);
        return todo;
    }

    // １件取得------------------------------------------------------------------------------
    public Todo getOne(Integer id) {
        Todo todo = todoMapper.getOne(id);
        if (todo == null) {
            throw new ResourceNotFoundException("TODO not found");
        }
        return todo;
    }

    // 削除------------------------------------------------------------------------------
    public boolean delete(Integer id) {
        todoMapper.deleteByParentId(id);
        boolean deleted = todoMapper.delete(id);
        if (!deleted) {
            throw new ResourceNotFoundException("TODO not found");
        }
        return true;
    }

    // 完了／未完了の切り替え-------------------------------------------------------------------
    public void updateStatus(Integer id, Status Status) {
        boolean updated = todoMapper.updateStatus(id, Status);
        if (!updated) {
            throw new ResourceNotFoundException("TODO not found");
        }
    }

    // カテゴリの移動------------------------------------------------------------------
    public void updateCategory(Integer id, Integer categoryId) {
        if (categoryId != null && categoryMapper.findById(categoryId) == null) {
            throw new ResourceNotFoundException("Category not found");
        }

        boolean updated = todoMapper.updateCategory(id, categoryId);
        if (!updated) {
            throw new ResourceNotFoundException("TODO not found");
        }
    }

    // タスク更新-------------------------------------------------------------------------------
    public boolean update(Integer id, TodoForm form) {
        validateBusinessRules(id, form);
        adjustTaskOptions(form);

        Todo todo = convertToEntity(form);
        todo.setId(id);

        Todo existingTodo = getOne(id);
        if (Boolean.TRUE.equals(todo.getDaily())) {
            todo.setDailyResetDate(existingTodo.getDailyResetDate());
        }

        boolean updated = todoMapper.update(todo);
        if (!updated) {
            throw new ResourceNotFoundException("TODO not found");
        }
        return true;
    }

    // 並び順変更-------------------------------------------------
    @Transactional
    public void updateSortOrder(List<TodoSortOrderForm> forms) {
        for (TodoSortOrderForm form : forms) {
            boolean updated = todoMapper.updateSortOrder(form.getId(), form.getSortOrder());
            if (!updated) {
                throw new ResourceNotFoundException("TODO not found");
            }
        }
    }

    // 超過タスク処理ロジック（日付超過時の挙動オプション）-------------------------------------------
    @Transactional
    public List<Todo> applyOverdueBehaviors(LocalDate today) {
        TodoForm allIncomplete = new TodoForm();
        allIncomplete.setStatus(Status.INCOMPLETE);
        List<Todo> list = todoMapper.getList(allIncomplete);

        for (Todo todo : list) {
            if (todo.getDueDate() != null && todo.getDueDate().isBefore(today)) {
                Integer behavior = todo.getOverdueBehavior();
                boolean updated = false;

                if (Integer.valueOf(1).equals(behavior)) {
                    todo.setDueDate(today);
                    updated = true;
                } else if (Integer.valueOf(2).equals(behavior)) {
                    todo.setStatus(Status.DONE);
                    updated = true;
                } else if (Integer.valueOf(3).equals(behavior)) {
                    todo.setDueDate(null);
                    todo.setDueDateUndecided(true);
                    todo.setOverdueBehavior(0);
                    updated = true;
                }

                if (updated) {
                    todoMapper.update(todo);
                }
            }
        }
        return list;
    }

    // 共通メソッド---------------------------------------------------------------
    private void validateBusinessRules(Integer todoId, TodoForm form) {
        validateCategoryId(form);
        validateParentId(todoId, form);
        validateDueDateOptions(form);
    }

    private void assignSortOrderIfNeeded(TodoForm form) {
        if (form.getSortOrder() != null) {
            return;
        }

        Integer maxSortOrder = todoMapper.findMaxSortOrderByParentId(form.getParentId());

        form.setSortOrder(maxSortOrder == null ? 1 : maxSortOrder + 1);
    }

    // ---------------------------------------------------------------
    private void validateCategoryId(TodoForm form) {
        if (form.getCategoryId() == null) {
            return;
        }

        if (categoryMapper.findById(form.getCategoryId()) == null) {
            throw new ResourceNotFoundException("Category not found");
        }
    }

    // ---------------------------------------------------------------
    private void validateParentId(Integer todoId, TodoForm form) {
        if (form.getParentId() == null) {
            return;
        }

        if (todoId != null && todoId.equals(form.getParentId())) {
            throw new BadRequestException("自分自身を親タスクには指定できません");
        }

        Todo parentTodo = todoMapper.getOne(form.getParentId());

        if (parentTodo == null) {
            throw new ResourceNotFoundException("Parent TODO not found");
        }

        if (parentTodo.getParentId() != null) {
            throw new BadRequestException("子タスクを親タスクには指定できません");
        }
    }

    // -----------------------------------------------------------------------------
    private void validateDueDateOptions(TodoForm form) {

        if (Boolean.TRUE.equals(form.getDaily())
                && form.getDueDate() != null) {

            throw new BadRequestException(
                    "dailyタスクにはdueDateを指定できません");
        }

        if (Boolean.TRUE.equals(form.getDaily())
                && Boolean.TRUE.equals(form.getDueDateUndecided())) {

            throw new BadRequestException(
                    "dailyタスクにはdueDateUndecidedを指定できません");
        }

        if (form.getDueDate() != null
                && Boolean.TRUE.equals(form.getDueDateUndecided())) {

            throw new BadRequestException(
                    "dueDateとdueDateUndecidedは同時指定できません");
        }
    }

    // 共通メソッド｜日付あり／日課／プレーンの選択（排他制御ロジック）----------------------------------
    private void adjustTaskOptions(TodoForm form) {
        if (form.getDueDateUndecided() == null) {
            form.setDueDateUndecided(false);
        }

        if (Boolean.TRUE.equals(form.getDaily())) {
            form.setDueDate(null);
            form.setDueDateUndecided(false);
            form.setAutoCarryOver(false);
            return;
        }

        if (Boolean.TRUE.equals(form.getDueDateUndecided())) {
            form.setDueDate(null);
            form.setDaily(false);
            form.setOverdueBehavior(0);
            form.setAutoCarryOver(false);
            return;
        }

        if (form.getDueDate() != null) {
            form.setDaily(false);
            form.setDueDateUndecided(false);
            return;
        }

        form.setAutoCarryOver(false);
    }

    // 共通メソッド｜form(DTO) ->
    // Todo(Entity)へ変換----------------------------------------------
    private Todo convertToEntity(TodoForm form) {
        Todo todo = new Todo();

        // 基本フィールド
        todo.setTitle(form.getTitle());
        todo.setDetails(form.getDetails());
        todo.setDueDate(form.getDueDate());
        todo.setDueDateUndecided(form.getDueDateUndecided());
        todo.setAutoCarryOver(form.getAutoCarryOver());
        todo.setDaily(form.getDaily());
        todo.setHasFlag(form.getHasFlag());

        if (Boolean.TRUE.equals(form.getDaily())) {
            todo.setDailyResetDate(LocalDate.now(clock));
        }

        // カテゴリー・日付超過挙動
        todo.setParentId(form.getParentId());
        todo.setCategoryId(form.getParentId() == null ? form.getCategoryId() : null);
        todo.setOverdueBehavior(form.getOverdueBehavior());
        todo.setSortOrder(form.getSortOrder());

        // ステータスの初期値設定
        if (form.getStatus() != null) {
            todo.setStatus(form.getStatus());
        } else {
            todo.setStatus(Status.INCOMPLETE);
        }

        return todo;
    }
}
