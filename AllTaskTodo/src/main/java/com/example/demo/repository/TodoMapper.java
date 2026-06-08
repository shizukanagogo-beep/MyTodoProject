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

	Integer findMaxSortOrderByParentId(@Param("parentId") Integer parentId, @Param("userId") Integer userId);

	Todo getOne(@Param("id") Integer id, @Param("userId") Integer userId);

	boolean delete(@Param("id") Integer id, @Param("userId") Integer userId);

	void deleteByParentId(@Param("parentId") Integer parentId, @Param("userId") Integer userId);

	boolean update(Todo todo);

	boolean updateSortOrder(@Param("id") Integer id, @Param("sortOrder") Integer sortOrder, @Param("userId") Integer userId);

	// カテゴリーのみ変更
	boolean updateCategory(@Param("id") Integer id, @Param("categoryId") Integer categoryId, @Param("userId") Integer userId);

	// ステータス（完了/未完了）のみ変更
	boolean updateStatus(@Param("id") Integer id, @Param("status") Status status, @Param("userId") Integer userId);

	// 2. 日課タスクを未完了(INCOMPLETE)に戻す
	void resetDailyTasks(Integer userId);

}
