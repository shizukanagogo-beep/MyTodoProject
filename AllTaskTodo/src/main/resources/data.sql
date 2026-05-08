-- 既存データのクリア
DELETE FROM todos;
DELETE FROM categories;
-- カテゴリの挿入（IDは自動採番されますが、通常は1, 2, 3となります）
INSERT INTO categories (name)
VALUES ('仕事'),
    ('プライベート'),
    ('買い物');
-- カテゴリIDを指定してタスクを挿入
-- 1:仕事, 2:プライベート, 3:買い物 と想定
INSERT INTO todos (
        title,
        status,
        due_date,
        is_daily,
        has_flag,
        auto_carry_over,
        category_id
    )
VALUES (
        'バックエンドの確認',
        'DONE',
        CURRENT_DATE,
        false,
        true,
        false,
        1
    );
INSERT INTO todos (
        title,
        status,
        due_date,
        is_daily,
        has_flag,
        auto_carry_over,
        category_id,
        details
    )
VALUES (
        'Reactでリスト表示する',
        'INCOMPLETE',
        CURRENT_DATE,
        false,
        false,
        true,
        1,
        'API連携を完成させる'
    );
INSERT INTO todos (
        title,
        status,
        due_date,
        is_daily,
        has_flag,
        auto_carry_over,
        category_id
    )
VALUES (
        '牛乳を買う',
        'INCOMPLETE',
        CURRENT_DATE,
        false,
        false,
        false,
        3
    );
INSERT INTO todos (
        title,
        status,
        due_date,
        is_daily,
        has_flag,
        auto_carry_over,
        category_id
    )
VALUES (
        '毎日のスクワット',
        'INCOMPLETE',
        CURRENT_DATE,
        true,
        false,
        false,
        2
    );