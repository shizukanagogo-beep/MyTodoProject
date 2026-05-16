package com.example.demo.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
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
import com.example.demo.dto.TodoSortOrderForm;
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

    // １件get---------------------------------------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<Todo> getOne(@PathVariable("id") Integer id) {
        Todo todo = todoService.getOne(id);
        return ResponseEntity.ok(todo);
    }

    // 削除---------------------------------------------------------------------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Integer id) {
        todoService.delete(id);
        return ResponseEntity
                .noContent()
                .build();
    }

    // 追加---------------------------------------------------------------------
    @PostMapping
    public ResponseEntity<Todo> add(@Valid @RequestBody TodoForm form) {
        Todo created = todoService.add(form);
        return ResponseEntity.ok(created);
    }

    // タスク編集----------------------------------------------------------------------
    @PutMapping("/{id}")
    public ResponseEntity<Todo> update(
            @PathVariable("id") Integer id,
            @Valid @RequestBody TodoForm form) {
        todoService.update(id, form);

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

    // 並び順変更-------------------------------------------------------------
    @PatchMapping("/sort-order")
    public ResponseEntity<Void> updateSortOrder(@RequestBody List<@Valid TodoSortOrderForm> forms) {
        todoService.updateSortOrder(forms);
        return ResponseEntity.ok().build();
    }
}
