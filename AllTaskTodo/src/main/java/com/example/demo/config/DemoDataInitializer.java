package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Component
public class DemoDataInitializer implements ApplicationRunner {

    private static final String DEMO_USERNAME = "demo";
    private static final String DEMO_PASSWORD_HASH =
            "$2y$10$JIv0whj67SRRcn6nDo18DeH8BGZisPtM1qvQcirZ3A1tVhHWluRGm";

    private final JdbcTemplate jdbcTemplate;

    @Value("${app.demo-data-init.enabled:false}")
    private boolean enabled;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!enabled) {
            return;
        }

        Integer demoUserId = upsertDemoUser();
        resetDemoData(demoUserId);
    }

    private Integer upsertDemoUser() {
        Integer existingUserId = findDemoUserId();

        if (existingUserId != null) {
            jdbcTemplate.update(
                    "UPDATE users SET password = ? WHERE id = ?",
                    DEMO_PASSWORD_HASH,
                    existingUserId);
            return existingUserId;
        }

        jdbcTemplate.update(
                "INSERT INTO users (username, password) VALUES (?, ?)",
                DEMO_USERNAME,
                DEMO_PASSWORD_HASH);

        return findDemoUserId();
    }

    private Integer findDemoUserId() {
        return jdbcTemplate.query(
                "SELECT id FROM users WHERE username = ?",
                resultSet -> resultSet.next() ? resultSet.getInt("id") : null,
                DEMO_USERNAME);
    }

    private void resetDemoData(Integer demoUserId) {
        jdbcTemplate.update("DELETE FROM todos WHERE user_id = ?", demoUserId);
        jdbcTemplate.update("DELETE FROM categories WHERE user_id = ?", demoUserId);

        Integer workCategoryId = insertCategory(demoUserId, "仕事", 1);
        Integer privateCategoryId = insertCategory(demoUserId, "プライベート", 2);
        Integer shoppingCategoryId = insertCategory(demoUserId, "買い物", 3);
        Integer learningCategoryId = insertCategory(demoUserId, "学習", 4);

        Integer releaseTodoId = insertTodo(
                demoUserId,
                "ポートフォリオを確認する",
                "INCOMPLETE",
                "ログイン、カテゴリ、タスク追加、並び替えをひと通り確認する",
                "CURRENT_DATE",
                false,
                false,
                false,
                null,
                true,
                workCategoryId,
                null,
                0,
                1);

        insertTodo(
                demoUserId,
                "README を整える",
                "INCOMPLETE",
                "使い方とデモアカウント情報を追記する",
                null,
                true,
                false,
                false,
                null,
                false,
                workCategoryId,
                null,
                0,
                2);

        insertTodo(
                demoUserId,
                "毎日の振り返り",
                "INCOMPLETE",
                "日課タスクの表示確認用",
                null,
                false,
                false,
                true,
                "CURRENT_DATE",
                false,
                privateCategoryId,
                null,
                0,
                3);

        insertTodo(
                demoUserId,
                "牛乳を買う",
                "INCOMPLETE",
                "カテゴリと日付ありタスクの確認用",
                "CURRENT_DATE",
                false,
                false,
                false,
                null,
                false,
                shoppingCategoryId,
                null,
                0,
                4);

        insertTodo(
                demoUserId,
                "Spring Security の復習",
                "DONE",
                "完了済みタスクの表示確認用",
                null,
                true,
                false,
                false,
                null,
                false,
                learningCategoryId,
                null,
                0,
                5);

        insertTodo(
                demoUserId,
                "ログイン状態を確認",
                "INCOMPLETE",
                "JWT が付与された状態で API を呼び出せるか見る",
                null,
                true,
                false,
                false,
                null,
                false,
                workCategoryId,
                releaseTodoId,
                0,
                1);
    }

    private Integer insertCategory(Integer userId, String name, Integer sortOrder) {
        jdbcTemplate.update(
                "INSERT INTO categories (user_id, name, sort_order) VALUES (?, ?, ?)",
                userId,
                name,
                sortOrder);

        return jdbcTemplate.query(
                """
                SELECT id
                FROM categories
                WHERE user_id = ?
                  AND name = ?
                  AND sort_order = ?
                """,
                resultSet -> resultSet.next() ? resultSet.getInt("id") : null,
                userId,
                name,
                sortOrder);
    }

    private Integer insertTodo(
            Integer userId,
            String title,
            String status,
            String details,
            String dueDateSql,
            boolean dueDateUndecided,
            boolean autoCarryOver,
            boolean daily,
            String dailyResetDateSql,
            boolean hasFlag,
            Integer categoryId,
            Integer parentId,
            Integer overdueBehavior,
            Integer sortOrder) {
        jdbcTemplate.update(
                """
                INSERT INTO todos (
                    user_id,
                    title,
                    status,
                    details,
                    due_date,
                    due_date_undecided,
                    auto_carry_over,
                    is_daily,
                    daily_reset_date,
                    has_flag,
                    category_id,
                    parent_id,
                    overdue_behavior,
                    sort_order
                )
                VALUES (
                    ?,
                    ?,
                    ?,
                    ?,
                    %s,
                    ?,
                    ?,
                    ?,
                    %s,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )
                """.formatted(dateExpression(dueDateSql), dateExpression(dailyResetDateSql)),
                userId,
                title,
                status,
                details,
                dueDateUndecided,
                autoCarryOver,
                daily,
                hasFlag,
                categoryId,
                parentId,
                overdueBehavior,
                sortOrder);

        return jdbcTemplate.query(
                """
                SELECT id
                FROM todos
                WHERE user_id = ?
                  AND title = ?
                  AND sort_order = ?
                """,
                resultSet -> resultSet.next() ? resultSet.getInt("id") : null,
                userId,
                title,
                sortOrder);
    }

    private String dateExpression(String dateSql) {
        return dateSql == null ? "NULL" : dateSql;
    }
}
