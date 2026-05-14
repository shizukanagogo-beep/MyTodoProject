-- 既存データのクリア
DELETE FROM todos;

DELETE FROM categories;

-- AUTO_INCREMENT をリセット
ALTER TABLE todos AUTO_INCREMENT = 1;

ALTER TABLE categories AUTO_INCREMENT = 1;

-- カテゴリの挿入
INSERT INTO
    categories (name, sort_order)
VALUES
    ('仕事', 1),
    ('プライベート', 2),
    ('買い物', 3),
    ('学習', 4),
    ('家事', 5);

-- ============================================================
-- 親タスク
-- ============================================================
INSERT INTO
    todos (
        id,
        title,
        status,
        details,
        due_date,
        due_date_undecided,
        auto_carry_over,
        is_daily,
        has_flag,
        category_id,
        parent_id,
        overdue_behavior,
        sort_order
    )
VALUES
    (
        1,
        'バックエンドAPIの動作確認',
        'INCOMPLETE',
        'TodoController / TodoService / TodoMapper の疎通を確認する',
        CURRENT_DATE,
        false,
        false,
        false,
        true,
        1,
        NULL,
        0,
        1
    ),
    (
        2,
        'フロントのタスク一覧を確認',
        'INCOMPLETE',
        '日付あり・日課・フラグ・カテゴリ別の表示を確認する',
        CURRENT_DATE,
        false,
        false,
        false,
        false,
        1,
        NULL,
        0,
        2
    ),
    (
        3,
        '期限超過時の繰り越しテスト',
        'INCOMPLETE',
        '期限を過ぎたら今日の日付に繰り越される',
        DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY),
        false,
        false,
        false,
        false,
        1,
        NULL,
        1,
        3
    ),
    (
        4,
        '期限超過時の完了テスト',
        'INCOMPLETE',
        '期限を過ぎたら自動的にDONEになる',
        date_sub(CURRENT_DATE, INTERVAL 2 DAY),
        false,
        false,
        false,
        false,
        1,
        NULL,
        2,
        4
    ),
    (
        5,
        '期限超過時の未定化テスト',
        'INCOMPLETE',
        '期限を過ぎたら日付を消して未定にする',
        DATE_SUB(CURRENT_DATE, INTERVAL 3 DAY),
        false,
        false,
        false,
        false,
        1,
        NULL,
        3,
        5
    ),
    (
        6,
        '旅行の準備',
        'INCOMPLETE',
        '持ち物や予約確認をサブタスクで管理する',
        date_add(CURRENT_DATE, INTERVAL 7 DAY),
        false,
        false,
        false,
        true,
        2,
        NULL,
        0,
        6
    ),
    (
        7,
        '牛乳を買う',
        'INCOMPLETE',
        '帰りにスーパーで買う',
        CURRENT_DATE,
        false,
        false,
        false,
        false,
        3,
        NULL,
        0,
        7
    ),
    (
        8,
        'TypeScriptの型整理',
        'INCOMPLETE',
        'types.ts と payload 型の整合性を確認する',
        NULL,
        true,
        false,
        false,
        false,
        4,
        NULL,
        0,
        8
    ),
    (
        9,
        '毎日のスクワット',
        'INCOMPLETE',
        '日課タスクのリセット確認用',
        NULL,
        false,
        false,
        true,
        false,
        2,
        NULL,
        0,
        9
    ),
    (
        10,
        '洗濯する',
        'DONE',
        '完了済み表示切替の確認用',
        NULL,
        true,
        false,
        false,
        false,
        5,
        NULL,
        0,
        10
    ),
    (
        11,
        'カテゴリなしのメモ',
        'INCOMPLETE',
        'カテゴリなし画面の確認用',
        NULL,
        true,
        false,
        false,
        false,
        NULL,
        NULL,
        0,
        11
    );

-- ============================================================
-- サブタスク
-- parent_id がある場合、category_id は NULL
-- ============================================================
INSERT INTO
    todos (
        title,
        status,
        details,
        due_date,
        due_date_undecided,
        auto_carry_over,
        is_daily,
        has_flag,
        category_id,
        parent_id,
        overdue_behavior,
        sort_order
    )
VALUES
    (
        'Controllerのレスポンスを確認',
        'INCOMPLETE',
        'POST / PUT / PATCH / DELETE のレスポンス確認',
        CURRENT_DATE,
        false,
        false,
        false,
        false,
        NULL,
        1,
        0,
        1
    ),
    (
        'Mapper XMLのSQLを確認',
        'DONE',
        'sort_order と parent_id のマッピング確認',
        NULL,
        true,
        false,
        false,
        false,
        NULL,
        1,
        0,
        2
    ),
    (
        '日付ありリストを確認',
        'INCOMPLETE',
        '今日・明日・未定フィルターを見る',
        CURRENT_DATE,
        false,
        false,
        false,
        false,
        NULL,
        2,
        0,
        1
    ),
    (
        'ランダム表示を確認',
        'INCOMPLETE',
        '未完了タスクから1件だけ表示されるか確認',
        NULL,
        true,
        false,
        false,
        true,
        NULL,
        2,
        0,
        2
    ),
    (
        '航空券を確認',
        'INCOMPLETE',
        '予約番号と出発時間を確認する',
        date_add(CURRENT_DATE, INTERVAL 2 DAY),
        false,
        false,
        false,
        true,
        NULL,
        6,
        0,
        1
    ),
    (
        '持ち物リストを作る',
        'INCOMPLETE',
        '充電器、財布、身分証、薬など',
        NULL,
        true,
        false,
        false,
        false,
        NULL,
        6,
        0,
        2
    ),
    (
        '宿泊先に連絡',
        'DONE',
        'チェックイン時間を伝える',
        date_add(CURRENT_DATE, INTERVAL 1 DAY),
        false,
        false,
        false,
        false,
        NULL,
        6,
        0,
        3
    ),
    (
        'スーパーに寄る',
        'INCOMPLETE',
        '駅前のスーパーに寄る',
        CURRENT_DATE,
        false,
        false,
        false,
        false,
        NULL,
        7,
        0,
        1
    );