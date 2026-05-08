DROP TABLE if EXISTS todos;
DROP TABLE if EXISTS categories;
---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
---------------------------------------------------------------------------
create table if not EXISTS todos(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title varchar(100),
    status varchar(20),
    details varchar(500),
    due_date DATE,
    auto_carry_over BOOLEAN DEFAULT FALSE,
    is_daily BOOLEAN DEFAULT FALSE,
    has_flag BOOLEAN DEFAULT FALSE,
    category_id int,
    overdue_behavior int DEFAULT 0,
    foreign KEY(category_id) references categories(id)
);