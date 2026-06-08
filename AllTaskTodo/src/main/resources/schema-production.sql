---------------------------------------------------------------------------
-- Production initial setup SQL
-- Run this only for the first setup of an empty production database.
-- This file intentionally does not contain DROP TABLE statements.
---------------------------------------------------------------------------

CREATE TABLE
    IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(50) NOT NULL,
        sort_order INT NULL,
        foreign KEY (user_id) references users (id)
    );

---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title varchar(100),
        status varchar(20),
        details varchar(500),
        due_date DATE,
        due_date_undecided BOOLEAN DEFAULT FALSE,
        auto_carry_over BOOLEAN DEFAULT FALSE,
        is_daily BOOLEAN DEFAULT FALSE,
        daily_reset_date DATE,
        has_flag BOOLEAN DEFAULT FALSE,
        category_id int,
        parent_id int,
        overdue_behavior int DEFAULT 0,
        sort_order INT NULL,
        foreign KEY (user_id) references users (id),
        foreign KEY (category_id) references categories (id),
        foreign KEY (parent_id) references todos (id) ON DELETE CASCADE
    );
