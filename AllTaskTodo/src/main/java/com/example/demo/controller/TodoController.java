package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.TodoForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;
import com.example.demo.service.TodoService;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@RestController
@RequestMapping("/todos")
@CrossOrigin(origins = "http://localhost:5173")
public class TodoController {

    private final TodoService todoService;

    // リスト取得--------------------------------------------------------------------

    @GetMapping
    public ResponseEntity<List<Todo>> getList(TodoForm form) {
        List<Todo> result = todoService.getList(form);

        return ResponseEntity.ok(result);
    }

    // ランダム---------------------------------------------------------------------
    @GetMapping("/random")
    public ResponseEntity<?> getRandom() {
        Todo todo = todoService.getRandom();
        if (todo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(todo);
    }

    // １っ件---------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable("id") Integer id) {
        Todo todo = todoService.getOne(id);
        if (todo == null) {
            return ResponseEntity
                    .status(404)
                    .body(Map.of("error", "TODO not found"));
        }
        return ResponseEntity.ok(todo);
    }

    // 削除---------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Integer id) {
        boolean exist = todoService.delete(id);
        if (!exist) {
            return ResponseEntity
                    .status(404)
                    .body(Map.of("error", "TODO not found"));
        }
        return ResponseEntity
                .noContent()
                .build();
    }

    // 追加---------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<?> add(@Valid @RequestBody TodoForm form,
            BindingResult result) {
        if (result.hasErrors()) {
            String errorMessage = result.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(Map.of("error", errorMessage));
        }
        Todo created = todoService.add(form);
        return ResponseEntity.ok(created);

    }

    // タスク編集----------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable("id") Integer id, @Valid @RequestBody TodoForm form,
            BindingResult result) {
        // 1. バリデーションチェック
        if (result.hasErrors()) {
            String errorMessage = result.getFieldError().getDefaultMessage();
            return ResponseEntity.status(400).body(Map.of("error", errorMessage));
        }

        // 2. サービスのアップデートメソッドを呼び出す
        // 引数はご提示いただいた通り (id, form) です
        boolean isUpdated = todoService.update(id, form);

        // 3. 更新に失敗した場合（対象のIDが存在しないなど）
        if (!isUpdated) {
            return ResponseEntity.status(404).body(Map.of("error", "TODO not found"));
        }

        // 4. 更新後のデータを取得して返却する
        Todo updated = todoService.getOne(id);
        return ResponseEntity.ok(updated);
    }

    // 完了／未完了の変更----------------------------------------------------------------------
    @PatchMapping("/{id}/status")
    public ResponseEntity<Void> updateStatus(@PathVariable("id") Integer id, @RequestBody Status status) {
        todoService.updateStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // カテゴリの変更--------------------------------------------------------------
    @PatchMapping("/{id}/category")
    public ResponseEntity<Void> updateCategory(@PathVariable("id") Integer id, @RequestBody Integer categoryId) {
        todoService.updateCategory(id, categoryId);
        return ResponseEntity.ok().build();
    }
}
