SET REFERENTIAL_INTEGRITY FALSE;

DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

SET REFERENTIAL_INTEGRITY TRUE;

CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        sort_order INT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

CREATE TABLE todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(100),
        status VARCHAR(20),
        details VARCHAR(500),
        due_date DATE,
        due_date_undecided BOOLEAN DEFAULT FALSE,
        auto_carry_over BOOLEAN DEFAULT FALSE,
        is_daily BOOLEAN DEFAULT FALSE,
        daily_reset_date DATE,
        has_flag BOOLEAN DEFAULT FALSE,
        category_id INT,
        parent_id INT,
        overdue_behavior INT DEFAULT 0,
        sort_order INT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (category_id) REFERENCES categories (id),
        FOREIGN KEY (parent_id) REFERENCES todos (id) ON DELETE CASCADE
    );
