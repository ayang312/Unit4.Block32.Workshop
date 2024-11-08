const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/acme_ice_cream_db"
);
const morgan = require("morgan");
const app = express();

// handling Payload POST/PUT
app.use(express.json());
app.use(morgan("dev"));

// GET all flavors
app.get("/api/flavors", async (req, res, next) => {
  try {
    const result = await client.query(
      "SELECT * FROM flavors ORDER BY created_at DESC"
    );
    res.send(result.rows);
  } catch (error) {
    next(error);
  }
});

// GET a single flavor by ID
app.get("/api/flavors/:id", async (req, res, next) => {
  try {
    const result = await client.query("SELECT * FROM flavors WHERE id = $1", [
      req.params.id,
    ]);
    res.send(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST a new flavor
app.post("/api/flavors", async (req, res, next) => {
  try {
    const result = await client.query(
      "INSERT INTO flavors (name, is_favorite) VALUES ($1, $2) RETURNING *",
      [req.body.name, req.body.is_favorite]
    );
    res.send(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT to update a flavor by ID
app.put("/api/flavors/:id", async (req, res, next) => {
  try {
    const result = await client.query(
      "UPDATE flavors SET name = $1, is_favorite=$2, updated_at = now() WHERE id = $3 RETURNING *",
      [req.body.name, req.body.is_favorite, req.params.id]
    );
    res.send(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE a flavor by ID
app.delete("/api/flavors/:id", async (req, res, next) => {
  try {
    await client.query("DELETE FROM flavors WHERE id=$1", [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

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
  console.log("table created");
  SQL = `
  INSERT INTO flavors (name, is_favorite) VALUES ('Coffee', true);
  INSERT INTO flavors (name, is_favorite) VALUES ('Vanilla', false);
  INSERT INTO flavors (name, is_favorite) VALUES ('Chocolate', false);
  INSERT INTO flavors (name, is_favorite) VALUES ('Strawberry', false);
  `;
  await client.query(SQL);
  console.log("data seeded");
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`Server listening on port ${port}`));
};

init();
