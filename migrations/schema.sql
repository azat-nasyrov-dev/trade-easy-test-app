CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    balance NUMERIC(10, 2) DEFAULT 0
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price_tradable NUMERIC(10, 2) NOT NULL,
    price_non_tradable NUMERIC(10, 2) NOT NULL
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    item_id INTEGER REFERENCES items(id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);