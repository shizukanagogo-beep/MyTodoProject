package com.example.demo.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:alltask_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.sql.init.mode=never"
})
@Sql(scripts = {
    "classpath:schema-test.sql",
    "classpath:data-test.sql"
})
class TodoControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("GET /todos: Todo一覧を取得できること")
  void testGetTodos_ShouldReturnTodoList() throws Exception {
    mockMvc.perform(get("/todos"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$", hasSize(8)))
        .andExpect(jsonPath("$[0].status").value("INCOMPLETE"));
  }

  @Test
  @DisplayName("POST /todos: Todoを作成できること")
  void testPostTodos_ShouldCreateTodo() throws Exception {
    String requestBody = """
        {
          "title": "APIから追加したタスク",
          "details": "MockMvcで作成",
          "categoryId": 1,
          "parentId": null,
          "dueDate": "2026-05-21",
          "dueDateUndecided": false,
          "daily": false,
          "hasFlag": true,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 9
        }
        """;

    mockMvc.perform(post("/todos")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").exists())
        .andExpect(jsonPath("$.title").value("APIから追加したタスク"))
        .andExpect(jsonPath("$.categoryId").value(1))
        .andExpect(jsonPath("$.dueDate").value("2026-05-21"))
        .andExpect(jsonPath("$.hasFlag").value(true))
        .andExpect(jsonPath("$.status").value("INCOMPLETE"))
        .andExpect(jsonPath("$.sortOrder").value(9));
  }

  @Test
  @DisplayName("POST /todos: titleが空文字の場合400を返すこと")
  void testPostTodos_BlankTitle_ShouldReturnBadRequest() throws Exception {
    String requestBody = """
        {
          "title": "",
          "details": "タイトルなし",
          "categoryId": 1,
          "parentId": null,
          "dueDate": null,
          "dueDateUndecided": true,
          "daily": false,
          "hasFlag": false,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 9
        }
        """;

    mockMvc.perform(post("/todos")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation failed"))
        .andExpect(jsonPath("$.details.title").value("タイトルを入力してください"));
  }

  @Test
  @DisplayName("POST /todos: 存在しないcategoryIdの場合404を返すこと")
  void testPostTodos_NotFoundCategoryId_ShouldReturnNotFound() throws Exception {
    String requestBody = """
        {
          "title": "存在しないカテゴリ",
          "details": "categoryId確認",
          "categoryId": 999,
          "parentId": null,
          "dueDate": null,
          "dueDateUndecided": false,
          "daily": false,
          "hasFlag": false,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 9
        }
        """;

    mockMvc.perform(post("/todos")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Category not found"));
  }

  @Test
  @DisplayName("POST /todos: 存在しないparentIdの場合404を返すこと")
  void testPostTodos_NotFoundParentId_ShouldReturnNotFound() throws Exception {
    String requestBody = """
        {
          "title": "存在しない親タスク",
          "details": "parentId確認",
          "categoryId": null,
          "parentId": 999,
          "dueDate": null,
          "dueDateUndecided": false,
          "daily": false,
          "hasFlag": false,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 9
        }
        """;

    mockMvc.perform(post("/todos")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.error").value("Parent TODO not found"));
  }

  @Test
  @DisplayName("POST /todos: 子タスクを親に指定した場合400を返すこと")
  void testPostTodos_ChildTodoAsParent_ShouldReturnBadRequest() throws Exception {
    String requestBody = """
        {
          "title": "不正な親タスク",
          "details": "parentId確認",
          "categoryId": null,
          "parentId": 7,
          "dueDate": null,
          "dueDateUndecided": false,
          "daily": false,
          "hasFlag": false,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 9
        }
        """;

    mockMvc.perform(post("/todos")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("子タスクを親タスクには指定できません"));
  }

  @Test
  @DisplayName("PUT /todos/{id}: Todoを更新できること")
  void testPutTodos_ShouldUpdateTodo() throws Exception {
    String requestBody = """
        {
          "title": "更新後のタスク",
          "details": "PUTで更新",
          "categoryId": 2,
          "parentId": null,
          "dueDate": null,
          "dueDateUndecided": true,
          "status": "INCOMPLETE",
          "daily": false,
          "hasFlag": true,
          "autoCarryOver": false,
          "overdueBehavior": 0,
          "sortOrder": 10
        }
        """;

    mockMvc.perform(put("/todos/1")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(1))
        .andExpect(jsonPath("$.title").value("更新後のタスク"))
        .andExpect(jsonPath("$.details").value("PUTで更新"))
        .andExpect(jsonPath("$.categoryId").value(2))
        .andExpect(jsonPath("$.dueDate").doesNotExist())
        .andExpect(jsonPath("$.dueDateUndecided").value(true))
        .andExpect(jsonPath("$.hasFlag").value(true))
        .andExpect(jsonPath("$.sortOrder").value(10));
  }

  @Test
  @DisplayName("PUT /todos/{id}: overdueBehaviorが範囲外の場合400を返すこと")
  void testPutTodos_InvalidOverdueBehavior_ShouldReturnBadRequest() throws Exception {
    String requestBody = """
        {
          "title": "更新後のタスク",
          "details": "PUTで更新",
          "categoryId": 2,
          "parentId": null,
          "dueDate": "2026-05-21",
          "dueDateUndecided": false,
          "status": "INCOMPLETE",
          "daily": false,
          "hasFlag": true,
          "autoCarryOver": false,
          "overdueBehavior": 4,
          "sortOrder": 10
        }
        """;

    mockMvc.perform(put("/todos/1")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.error").value("Validation failed"))
        .andExpect(jsonPath("$.details.overdueBehavior").value("期限超過時の挙動は3以下で指定してください"));
  }

  @Test
  @DisplayName("PATCH /todos/{id}/status: ステータスを更新できること")
  void testPatchTodoStatus_ShouldUpdateStatus() throws Exception {
    mockMvc.perform(patch("/todos/1/status")
        .contentType(MediaType.APPLICATION_JSON)
        .content("\"DONE\""))
        .andExpect(status().isOk());

    mockMvc.perform(get("/todos/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.status").value("DONE"));
  }

  @Test
  @DisplayName("PATCH /todos/sort-order: 並び順を更新できること")
  void testPatchTodoSortOrder_ShouldUpdateSortOrder() throws Exception {
    String requestBody = """
        [
          { "id": 1, "sortOrder": 20 },
          { "id": 2, "sortOrder": 10 }
        ]
        """;

    mockMvc.perform(patch("/todos/sort-order")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk());

    mockMvc.perform(get("/todos/1"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sortOrder").value(20));

    mockMvc.perform(get("/todos/2"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sortOrder").value(10));
  }

  @Test
  @DisplayName("DELETE /todos/{id}: Todoを削除できること")
  void testDeleteTodo_ShouldDeleteTodo() throws Exception {
    mockMvc.perform(delete("/todos/6"))
        .andExpect(status().isNoContent());

    mockMvc.perform(get("/todos/6"))
        .andExpect(status().isNotFound());

    mockMvc.perform(get("/todos/7"))
        .andExpect(status().isNotFound());

    mockMvc.perform(get("/todos/8"))
        .andExpect(status().isNotFound());
  }
}