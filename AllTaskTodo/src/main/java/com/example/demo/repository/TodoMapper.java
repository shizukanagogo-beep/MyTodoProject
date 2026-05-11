package com.example.demo.repository;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.example.demo.dto.TodoForm;
import com.example.demo.entity.Status;
import com.example.demo.entity.Todo;

@Mapper
public interface TodoMapper {

	List<Todo> getList(TodoForm form);

	void add(Todo todo);

	Todo getOne(Integer id);

	boolean delete(Integer id);

	boolean update(Todo todo);

	void updateSortOrder(@Param("id") Integer id, @Param("sortOrder") Integer sortOrder);

	// カテゴリーのみ変更
	void updateCategory(@Param("id") Integer id, @Param("categoryId") Integer categoryId);

	// ステータス（完了/未完了）のみ変更
	void updateStatus(@Param("id") Integer id, @Param("status") Status status);

	// 2. 日課タスクを未完了(INCOMPLETE)に戻す
	void resetDailyTasks();

	// 3. ランダムに1件取得する
	Todo getRandom();

}
