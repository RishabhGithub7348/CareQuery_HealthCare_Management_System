import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import db from "./db";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  doctor_name?: string;
  date: string;
  time: string;
  reason?: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  created_at: string;
}

export async function getDoctors() {
  const result = await db.query<{
    id: string;
    name: string;
    specialty: string;
  }>("SELECT id, name, specialty FROM doctors");

  return result.rows;
}

export async function getAppointments(patientId?: string) {
  const query = patientId
    ? `
      SELECT a.*, d.name as doctor_name
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      WHERE a.patient_id = $1
      ORDER BY a.date, a.time
    `
    : `
      SELECT a.*, d.name as doctor_name
      FROM appointments a
      LEFT JOIN doctors d ON a.doctor_id = d.id
      ORDER BY a.date, a.time
    `;
  const result = await db.query<Appointment>(
    query,
    patientId ? [patientId] : []
  );
  return result.rows.map((row) => ({
    ...row,
    date: format(new Date(row.date), "yyyy-MM-dd"),
    created_at: format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
  }));
}

export async function createAppointment(
  appointment: Omit<Appointment, "id" | "created_at">,
  userId: string
) {
  const id = uuidv4();
  const query = `
    INSERT INTO appointments (id, patient_id, doctor_id, date, time, reason, status, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    RETURNING id
  `;
  const values = [
    id,
    appointment.patient_id,
    appointment.doctor_id,
    appointment.date,
    appointment.time,
    appointment.reason,
    appointment.status || "Scheduled",
  ];
  await db.query(query, values);
  await db.query(
    "INSERT INTO audit_log (id, action, appointment_id, user_id, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
    [uuidv4(), "create_appointment", id, userId]
  );
  const channel = new BroadcastChannel("carequery-updates");
  channel.postMessage({ type: "appointment-update" });
  channel.close();
  return id;
}

export async function updateAppointment(
  appointmentId: string,
  updates: Partial<Appointment>,
  userId: string
) {
  const fields = Object.keys(updates)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(", ");
  const values = Object.values(updates);
  if (fields.length === 0) return;
  const query = `UPDATE appointments SET ${fields} WHERE id = $${values.length + 1}`;
  await db.query(query, [...values, appointmentId]);
  await db.query(
    "INSERT INTO audit_log (id, action, appointment_id, user_id, timestamp) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)",
    [uuidv4(), "update_appointment", appointmentId, userId]
  );
  const channel = new BroadcastChannel("carequery-updates");
  channel.postMessage({ type: "appointment-update" });
  channel.close();
}

export function suggestTimeSlots(
  availability: Record<string, string[]>,
  date: string
) {
  return availability[date] || [];
}
