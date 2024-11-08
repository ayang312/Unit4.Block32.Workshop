const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_ice_cream_db"
);
const morgan = require("morgan");
const app = express();

// handling Payload POST/PUT
app.use(express.json());
app.use(morgan('dev'));

const init = async () => {
  await client.connect();
  console.log("Connected to database");
  let SQL = `
  DROP TABLE IF EXISTS flavors;
  CREATE TABLE flavors(
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
  );
  `;
  await client.query(SQL);
  console.log('table created');
  SQL = `
  INSERT INTO flavors (name, is_favorite) VALUES ('Vanilla', true);
  INSERT INTO flavors (name, is_favorite) VALUES ('Chocolate', false);
  INSERT INTO flavors (name, is_favorite) VALUES ('Strawberry', true);
  `;
  await client.query(SQL);
  console.log('data seeded');
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

init();
