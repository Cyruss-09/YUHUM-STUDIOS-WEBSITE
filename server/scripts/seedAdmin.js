require("dotenv").config();
const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function seedAdmin() {
  const email = "admin@yuhumstudios.com";
  const plainPassword = "changeme123!"; // change immediately after first login
  const hash = await bcrypt.hash(plainPassword, 12);

  try {
    await pool.query(
      `INSERT INTO admins (name, email, password_hash) VALUES ($1, $2, $3)`,
      ["Super Admin", email, hash],
    );
    console.log("Admin seeded:", email);
  } catch (err) {
    console.error("Seed failed:", err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
