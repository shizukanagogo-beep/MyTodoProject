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
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("GET /categories: カテゴリ一覧を取得できること")
    void testGetCategories_ShouldReturnCategoryList() throws Exception {
        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("仕事"))
                .andExpect(jsonPath("$[0].sortOrder").value(1));
    }

    @Test
    @DisplayName("POST /categories: カテゴリを作成できること")
    void testPostCategories_ShouldCreateCategory() throws Exception {
        String requestBody = """
                {
                  "name": "追加カテゴリ",
                  "sortOrder": 5
                }
                """;

        mockMvc.perform(post("/categories")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("追加カテゴリ"))
                .andExpect(jsonPath("$.sortOrder").value(5));
    }

    @Test
    @DisplayName("PUT /categories/{id}: カテゴリを更新できること")
    void testPutCategories_ShouldUpdateCategory() throws Exception {
        String requestBody = """
                {
                  "name": "更新後カテゴリ",
                  "sortOrder": 10
                }
                """;

        mockMvc.perform(put("/categories/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("更新後カテゴリ"))
                .andExpect(jsonPath("$.sortOrder").value(10));
    }

    @Test
    @DisplayName("PATCH /categories/sort-order: カテゴリの並び順を更新できること")
    void testPatchCategorySortOrder_ShouldUpdateSortOrder() throws Exception {
        String requestBody = """
                [
                  { "id": 1, "sortOrder": 4 },
                  { "id": 4, "sortOrder": 1 }
                ]
                """;

        mockMvc.perform(patch("/categories/sort-order")
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk());

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(4))
                .andExpect(jsonPath("$[0].sortOrder").value(1));
    }

    @Test
    @DisplayName("DELETE /categories/{id}: カテゴリとカテゴリ内Todoを削除できること")
    void testDeleteCategory_ShouldDeleteCategoryAndTodos() throws Exception {
        mockMvc.perform(delete("/categories/1"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        mockMvc.perform(get("/todos/6"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/todos/7"))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/todos/8"))
                .andExpect(status().isNotFound());
    }
}