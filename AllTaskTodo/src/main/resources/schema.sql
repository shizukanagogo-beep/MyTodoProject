DROP TABLE IF EXISTS todos;

DROP TABLE IF EXISTS categories;

---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        sort_order INT NULL
    );

---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title varchar(100),
        status varchar(20),
        details varchar(500), 
        due_date DATE,
        due_date_undecided BOOLEAN DEFAULT FALSE,
        auto_carry_over BOOLEAN DEFAULT FALSE,
        is_daily BOOLEAN DEFAULT FALSE,
        has_flag BOOLEAN DEFAULT FALSE,
        category_id int,
        parent_id int,
        overdue_behavior int DEFAULT 0,
        sort_order INT NULL,
        daily_reset_date DATE,
        foreign KEY (category_id) references categories (id),
        foreign KEY (parent_id) references todos (id) ON DELETE CASCADE
    );
