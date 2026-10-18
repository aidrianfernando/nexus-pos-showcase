const { pool } = require('../config/db');

async function findAll() {
  const result = await pool.query(
    `SELECT *
     FROM categories
     ORDER BY id ASC`
  );

  return result.rows;
}


async function findById(id) {
  const result = await pool.query(
    `SELECT *
     FROM categories
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}


async function create(data) {
  const { name, description } = data;

  const result = await pool.query(
    `INSERT INTO categories (name, description)
     VALUES ($1, $2)
     RETURNING *`,
    [name, description]
  );

  return result.rows[0];
}


async function update(id, data) {
  const { name, description, is_active } = data;

  const result = await pool.query(
    `UPDATE categories
     SET name = $1,
         description = $2,
         is_active = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING *`,
    [name, description, is_active, id]
  );

  return result.rows[0];
}



async function findByName(name) {
  const result = await pool.query(
    `
    SELECT *
    FROM categories
    WHERE LOWER(name) = LOWER($1)
    LIMIT 1
    `,
    [name]
  );

  return result.rows[0] || null;
}

async function setActive(id, isActive) {
  const result = await pool.query(
    `
    UPDATE categories
    SET is_active = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *
    `,
    [isActive, id]
  );

  return result.rows[0] || null;
}


module.exports = {
  findAll,
  findById,
  create,
  update,
  findByName,
  setActive,

};
