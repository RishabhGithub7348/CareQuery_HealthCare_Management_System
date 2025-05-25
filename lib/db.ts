import { PGlite } from "@electric-sql/pglite";
import { live } from "@electric-sql/pglite/live";
import { seedAll } from "./seed";

const db = new PGlite({ dataDir: "idb://carequery", extensions: { live } });

export async function initDB(seed: boolean = false) {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Staff')),
      name TEXT NOT NULL,
      email TEXT
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      contact TEXT,
      address TEXT,
      medical_condition TEXT,
      medical_id TEXT UNIQUE,
      dob DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      specialty TEXT,
      availability JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id UUID PRIMARY KEY,
      patient_id UUID REFERENCES patients(id),
      doctor_id UUID REFERENCES doctors(id),
      date DATE NOT NULL,
      time TEXT NOT NULL,
      reason TEXT,
      status TEXT CHECK (status IN ('Scheduled', 'Completed', 'Cancelled')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY,
      patient_id UUID REFERENCES patients(id),
      file_name TEXT NOT NULL,
      file_data TEXT NOT NULL,
      uploaded_by UUID REFERENCES users(id),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id UUID PRIMARY KEY,
      action TEXT NOT NULL,
      patient_id UUID,
      doctor_id UUID,
      appointment_id UUID,
      user_id UUID REFERENCES users(id),
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (seed) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = (await db.query("SELECT COUNT(*) FROM patients;")) as any;
    if (parseInt(result.rows[0].count) === 0) {
      await seedAll();
    }
  }
}

export default db;
