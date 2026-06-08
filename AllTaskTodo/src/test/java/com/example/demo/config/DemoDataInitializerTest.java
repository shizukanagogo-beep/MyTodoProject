package com.example.demo.config;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:demo_init_test;MODE=MySQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.sql.init.mode=always",
    "spring.sql.init.schema-locations=classpath:/schema-test.sql",
    "spring.sql.init.data-locations=classpath:/data-test.sql",
    "app.demo-data-init.enabled=true"
})
class DemoDataInitializerTest {

  @Autowired
  private DemoDataInitializer demoDataInitializer;

  @Autowired
  private JdbcTemplate jdbcTemplate;

  @Test
  @DisplayName("demoユーザーとdemoデータが起動時に作成されること")
  void testDemoDataInitializer_ShouldCreateDemoUserAndData() {
    Integer demoUserId = findDemoUserId();

    assertNotNull(demoUserId);
    assertEquals(4, countCategories(demoUserId));
    assertEquals(6, countTodos(demoUserId));
  }

  @Test
  @DisplayName("demoデータだけをリセットし、他ユーザーのデータは残すこと")
  void testDemoDataInitializer_ShouldResetOnlyDemoData() {
    Integer demoUserId = findDemoUserId();
    Integer testUserTodoCountBefore = countTodos(1);

    jdbcTemplate.update(
        """
        INSERT INTO todos (
          user_id,
          title,
          status,
          details,
          due_date_undecided,
          auto_carry_over,
          is_daily,
          has_flag,
          overdue_behavior,
          sort_order
        )
        VALUES (?, '消えるdemoタスク', 'INCOMPLETE', 'reset確認用', false, false, false, false, 0, 99)
        """,
        demoUserId);

    assertEquals(7, countTodos(demoUserId));

    demoDataInitializer.run(null);

    assertEquals(4, countCategories(demoUserId));
    assertEquals(6, countTodos(demoUserId));
    assertEquals(testUserTodoCountBefore, countTodos(1));
  }

  private Integer findDemoUserId() {
    return jdbcTemplate.query(
        "SELECT id FROM users WHERE username = 'demo'",
        resultSet -> resultSet.next() ? resultSet.getInt("id") : null);
  }

  private Integer countCategories(Integer userId) {
    return jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM categories WHERE user_id = ?",
        Integer.class,
        userId);
  }

  private Integer countTodos(Integer userId) {
    return jdbcTemplate.queryForObject(
        "SELECT COUNT(*) FROM todos WHERE user_id = ?",
        Integer.class,
        userId);
  }
}
