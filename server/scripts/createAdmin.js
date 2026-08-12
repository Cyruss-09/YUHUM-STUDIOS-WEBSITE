// Usage: node scripts/createAdmin.js someone@example.com
// Promotes an already-registered user to role = 'admin'.
require("dotenv").config();
const pool = require("../config/db");

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: node scripts/createAdmin.js <email>");
    process.exit(1);
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = 'admin' WHERE email = $1 RETURNING id, username, email, role`,
      [email.toLowerCase().trim()],
    );

    if (result.rows.length === 0) {
      console.error(
        `❌ No user found with email "${email}". Register the account first, then run this script.`,
      );
      process.exit(1);
    }

    console.log("✅ Promoted to admin:", result.rows[0]);
  } catch (err) {
    console.error("❌ Failed to promote user:", err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
