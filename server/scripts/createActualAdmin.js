require("dotenv").config();
const pool = require("../config/db");
const bcrypt = require("bcrypt");

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Admin";

  if (!email || !password) {
    console.error(
      "Usage: node scripts/createActualAdmin.js <email> <password> <name>",
    );
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO admins (name, email, password_hash, role) 
       VALUES ($1, $2, $3, 'admin') 
       ON CONFLICT (email) DO UPDATE SET password_hash = $3 
       RETURNING id, name, email, role`,
      [name, email.toLowerCase().trim(), passwordHash],
    );

    console.log("✅ Admin account created/updated:", result.rows[0]);
  } catch (err) {
    console.error("❌ Failed:", err.message);
  } finally {
    await pool.end();
  }
}

main();
