SET REFERENTIAL_INTEGRITY FALSE;

DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS categories;

SET REFERENTIAL_INTEGRITY TRU

CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        sort_order INT NULL
    );

CREATE TABLE todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(100),
        status VARCHAR(20),
        details VARCHAR(500),
        due_date DATE,
        due_date_undecided BOOLEAN DEFAULT FALSE,
        auto_carry_over BOOLEAN DEFAULT FALSE,
        is_daily BOOLEAN DEFAULT FALSE,
        has_flag BOOLEAN DEFAULT FALSE,
        category_id INT,
        parent_id INT,
        overdue_behavior INT DEFAULT 0,
        sort_order INT NULL,
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (parent_id) REFERENCES todos (id) ON DELETE CASCADE
    );