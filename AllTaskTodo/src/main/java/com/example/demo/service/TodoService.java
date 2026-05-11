package com.example.demo.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.TodoForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;
import com.example.demo.repository.TodoMapper;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class TodoService {
    private final TodoMapper todoMapper;

    // 全件取得（日課リセット・繰り越し処理を含む）-------------------------------------------------------
    @Transactional
    public List<Todo> getList(TodoForm condition) {
        LocalDate today = LocalDate.now();

        // 既存の定時バッチ的な処理
        todoMapper.resetDailyTasks();
        applyOverdueBehaviors(today);
        // 万能DTO（TodoForm）をそのままMapperに渡して検索
        return todoMapper.getList(condition);
    }

    // ランダムピック-------------------------------------------------------------------------------
    public Todo getRandom() {
        return todoMapper.getRandom();
    }

    // 新規追加-------------------------------------------------------------------------------
    public Todo add(TodoForm form) {
        // オプション（日課か日付ありかなど）の整合性を調整
        adjustTaskOptions(form);
        // Form(DTO)からEntityへ変換
        Todo todo = convertToEntity(form);
        // DBへ登録（MyBatisによりIDがセットされる）
        todoMapper.add(todo);
        return todo;
    }

    // １件取得------------------------------------------------------------------------------
    public Todo getOne(Integer id) {
        return todoMapper.getOne(id);
    }

    // 削除------------------------------------------------------------------------------
    public boolean delete(Integer id) {
        return todoMapper.delete(id);
    }

    // 完了／未完了の切り替え-------------------------------------------------------------------
    public void updateStatus(Integer id, Status Status) {
        todoMapper.updateStatus(id, Status);
    }

    // カテゴリの移動------------------------------------------------------------------
    public void updateCategory(Integer id, Integer CategoryId) {
        todoMapper.updateCategory(id, CategoryId);
    }

    // タスク更新-------------------------------------------------------------------------------
    public boolean update(Integer id, TodoForm form) {
        // オプションの整合性を調整
        adjustTaskOptions(form);

        // Form(DTO)からEntityへ変換
        Todo todo = convertToEntity(form);
        todo.setId(id);

        return todoMapper.update(todo);
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
                    updated = true;
                }

                if (updated) {
                    todoMapper.update(todo);
                }
            }
        }
        return list;
    }

    // 共通メソッド｜日付あり／日課／プレーンの選択（排他制御ロジック）----------------------------------
    private void adjustTaskOptions(TodoForm form) {
        if (Boolean.TRUE.equals(form.getDaily())) {
            form.setDueDate(null);
            form.setAutoCarryOver(false);
            return;
        }

        if (form.getDueDate() != null) {
            form.setDaily(false);
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
        todo.setAutoCarryOver(form.getAutoCarryOver());
        todo.setDaily(form.getDaily());
        todo.setHasFlag(form.getHasFlag());

        // カテゴリー・日付超過挙動
        todo.setCategoryId(form.getCategoryId());
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