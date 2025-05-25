/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import db from "./db";

export interface Patient {
  id: string;
  name: string;
  email: string;
  contact: string;
  address: string;
  medical_condition: string;
  medical_id: string;
  dob: string;
  created_at: string;
}

export async function createPatient(
  patient: Omit<Patient, "id" | "created_at">,
  userId: string
) {
  const id = uuidv4();
  try {
    await db.query(
      "INSERT INTO patients (id, name, email, contact, address, medical_condition, medical_id, dob) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);",
      [
        id,
        patient.name,
        patient.email,
        patient.contact,
        patient.address,
        patient.medical_condition,
        patient.medical_id,
        patient.dob,
      ]
    );
    await db.query(
      "INSERT INTO audit_log (id, action, patient_id, user_id) VALUES ($1, $2, $3, $4);",
      [uuidv4(), "create_patient", id, userId]
    );
    const channel = new BroadcastChannel("carequery");
    channel.postMessage("patient-update");
    return id;
  } catch (error: any) {
    if (error.message.includes("patients_medical_id_key")) {
      throw new Error("Medical ID already exists");
    }
    throw error;
  }
}

export async function getPatients() {
  const result = await db.query<{
    id: string;
    name: string;
    email: string;
    contact: string;
    address: string;
    medical_condition: string;
    medical_id: string;
    dob: string;
    created_at: string;
  }>("SELECT * FROM patients;");
  return result.rows.map((patient) => ({
    ...patient,
    dob: format(new Date(patient.dob), "yyyy-MM-dd"),
    created_at: format(new Date(patient.created_at), "yyyy-MM-dd HH:mm:ss"),
  })) as Patient[];
}

export async function updatePatient(
  id: string,
  patient: Partial<Patient>,
  userId: string
) {
  try {
    const fields = Object.entries(patient)
      .filter(([key]) => key !== "id" && key !== "created_at")
      .map(
        ([key, value]) => `${key} = $${Object.keys(patient).indexOf(key) + 1}`
      );
    const values = Object.values(patient).filter(
      (_, i) =>
        Object.keys(patient)[i] !== "id" &&
        Object.keys(patient)[i] !== "created_at"
    );
    await db.query(
      `UPDATE patients SET ${fields.join(", ")} WHERE id = $${fields.length + 1};`,
      [...values, id]
    );
    await db.query(
      "INSERT INTO audit_log (id, action, patient_id, user_id) VALUES ($1, $2, $3, $4);",
      [uuidv4(), "update_patient", id, userId]
    );
    const channel = new BroadcastChannel("carequery");
    channel.postMessage("patient-update");
  } catch (error: any) {
    if (error.message.includes("patients_medical_id_key")) {
      throw new Error("Medical ID already exists");
    }
    throw error;
  }
}

export async function deletePatient(id: string, userId: string) {
  await db.query("DELETE FROM patients WHERE id = $1;", [id]);
  await db.query(
    "INSERT INTO audit_log (id, action, patient_id, user_id) VALUES ($1, $2, $3, $4);",
    [uuidv4(), "delete_patient", id, userId]
  );
  const channel = new BroadcastChannel("carequery");
  channel.postMessage("patient-update");
}
