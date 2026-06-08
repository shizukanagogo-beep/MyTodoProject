package com.example.demo.controller;

import static org.hamcrest.Matchers.blankOrNullString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
class AuthControllerTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  @DisplayName("GET /todos: JWTなしの場合401を返すこと")
  void testTodosWithoutJwt_ShouldReturnUnauthorized() throws Exception {
    mockMvc.perform(get("/todos"))
        .andExpect(status().isUnauthorized());
  }

  @Test
  @DisplayName("POST /auth/login: 正しい認証情報でJWTを返すこと")
  void testLogin_ShouldReturnJwt() throws Exception {
    String requestBody = """
        {
          "username": "test",
          "password": "password"
        }
        """;

    mockMvc.perform(post("/auth/login")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", not(blankOrNullString())))
        .andExpect(jsonPath("$.username").value("test"));
  }

  @Test
  @DisplayName("POST /auth/register: 新規ユーザーを登録してJWTを返すこと")
  void testRegister_ShouldCreateUserAndReturnJwt() throws Exception {
    String requestBody = """
        {
          "username": "new-user",
          "password": "new-password"
        }
        """;

    mockMvc.perform(post("/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.token", not(blankOrNullString())))
        .andExpect(jsonPath("$.username").value("new-user"));
  }
}
