CREATE TABLE store_settings (
    id BIGINT PRIMARY KEY,
    store_name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    email VARCHAR(255),
    phone VARCHAR(255),
    address VARCHAR(255),
    website VARCHAR(255)
);
