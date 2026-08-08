// server/scripts/seedAdmin.js
import bcrypt from "bcrypt";
import db from "../config/db.js"; // your mysql2/pg pool

async function seedAdmin() {
  const email = "admin@yuhumstudios.com";
  const plainPassword = "changeme123!"; // change immediately after first login
  const hash = await bcrypt.hash(plainPassword, 12);

  await db.query(
    `INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)`,
    ["Super Admin", email, hash]
  );

  console.log("Admin seeded:", email);
  process.exit();
}

seedAdmin();