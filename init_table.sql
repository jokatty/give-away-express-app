CREATE TABLE IF NOT EXISTS users(
  id SERIAL PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  password TEXT
);

CREATE TYPE category AS ENUM ('furnitures', 'electronics', 'appliances','toys');

CREATE TABLE IF NOT EXISTS listings (
    id SERIAL PRIMARY KEY,
    product_name text,
    product_description text,
    is_available boolean,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id integer,
    product_image_info text,
    product_category category
);

CREATE TABLE IF NOT EXISTS requests (
    id SERIAL PRIMARY KEY,
    listing_id integer,
    user_id integer
);