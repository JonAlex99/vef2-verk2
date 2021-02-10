import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
} = process.env;

if (!connectionString) {
  console.error('Vantar DATABASE_URL');
  process.exit(1);
}

async function query(q, values = []) {
  const client = new pg.Client({ connectionString });

  await client.connect();

  try {
    const result = await client.query(q, values);

    return result;
  } catch (err) {
    throw err;
  } finally {
    await client.end();
  }
}

export async function insert(data) {
  var fela = true
  if (!data.checkBox) fela = false;
  const q = `
INSERT INTO signatures
(name, nationalId, comment, anonymous, signed)
VALUES
($1, $2, $3, $4, $5)`;
  const values = [data.nafn, data.kt, data.ath, fela, new Date()];

  return query(q, values);
}

export async function select() {
  const result = await query('SELECT * FROM signatures ORDER BY id');

  return result.rows;
}

export async function update(id) {
  const q = `
UPDATE signatures
SET processed = true, updated = current_timestamp
WHERE id = $1`;

  return query(q, [id]);
}

export async function deleteRow(id) {
  const q = 'DELETE FROM signatures WHERE id = $1';

  return query(q, [id]);
}
// TODO gagnagrunnstengingar
