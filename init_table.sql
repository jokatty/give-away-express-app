CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  password TEXT
);

CREATE TABLE IF NOT EXISTS listings(
  id SERIAL PRIMARY KEY,
  product_category TEXT,
  product_name TEXT,
  product_description TEXT,
  product_image_info BYTEA,
  posted_on DATE,
  posted_by INT,
  is_available BOOLEAN
);

CREATE TABLE IF NOT EXISTS requests(
  id SERIAL PRIMARY KEY,
  listing_id INTEGER
);