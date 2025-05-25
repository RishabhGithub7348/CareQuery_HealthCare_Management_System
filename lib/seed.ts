import { v4 as uuidv4 } from "uuid";
import db from "./db";

export async function seedDoctors() {
  const doctors = [
    {
      name: "Dr. John Smith",
      specialty: "General Practitioner",
      availability: {
        "2025-05-21": ["09:00", "10:00", "11:00", "12:00"],
        "2025-05-22": ["09:00", "10:00", "11:00"],
      },
    },
    {
      name: "Dr. Emily Chen",
      specialty: "Cardiologist",
      availability: {
        "2025-05-23": ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00"],
        "2025-06-01": ["10:00", "11:00", "12:00"],
      },
    },
    {
      name: "Dr. Raj Patel",
      specialty: "Pediatrician",
      availability: {
        "2025-06-02": ["13:00", "14:00", "15:00", "16:00", "17:00"],
        "2025-06-03": ["13:00", "14:00", "15:00"],
      },
    },
  ];

  for (const doctor of doctors) {
    const existing = await db.query("SELECT id FROM doctors WHERE name = $1;", [
      doctor.name,
    ]);
    if (existing.rows.length === 0) {
      await db.query(
        "INSERT INTO doctors (id, name, specialty, availability) VALUES ($1, $2, $3, $4);",
        [
          uuidv4(),
          doctor.name,
          doctor.specialty,
          JSON.stringify(doctor.availability),
        ]
      );
    }
  }
  console.log("Doctors seeded successfully");
}

export async function seedPatients() {
  const patients = [
    {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      contact: "555-0123",
      address: "123 Main St, Springfield",
      medical_condition: "Hypertension",
      medical_id: "JD123",
      dob: "1980-04-15",
    },
    {
      name: "Michael Brown",
      email: "michael.brown@example.com",
      contact: "555-0456",
      address: "456 Oak Ave, Springfield",
      medical_condition: "Diabetes",
      medical_id: "MB456",
      dob: "1975-08-22",
    },
    {
      name: "Sarah Lee",
      email: "sarah.lee@example.com",
      contact: "555-0789",
      address: "789 Pine Rd, Springfield",
      medical_condition: "Asthma",
      medical_id: "SL789",
      dob: "1990-12-10",
    },
  ];

  for (const patient of patients) {
    const existing = await db.query(
      "SELECT id FROM patients WHERE medical_id = $1;",
      [patient.medical_id]
    );
    if (existing.rows.length === 0) {
      await db.query(
        "INSERT INTO patients (id, name, email, contact, address, medical_condition, medical_id, dob) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);",
        [
          uuidv4(),
          patient.name,
          patient.email,
          patient.contact,
          patient.address,
          patient.medical_condition,
          patient.medical_id,
          patient.dob,
        ]
      );
    }
  }
  console.log("Patients seeded successfully");
}

export async function seedAll() {
  await seedDoctors();
  await seedPatients();
}
