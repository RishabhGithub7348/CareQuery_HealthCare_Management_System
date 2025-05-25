import emailjs from "@emailjs/browser";
import { v4 as uuidv4 } from "uuid";
import db from "./db";

export interface Report {
  id: string;
  patient_id: string;
  file_name: string;
  file_data: string;
  uploaded_by: string;
  uploaded_at: string;
}

export async function uploadReport(
  file: File,
  patientId: string,
  userId: string
) {
  const reader = new FileReader();
  return new Promise<void>((resolve, reject) => {
    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (!base64) return reject(new Error("Failed to read file"));
      const id = uuidv4();
      await db.query(
        "INSERT INTO reports (id, patient_id, file_name, file_data, uploaded_by) VALUES ($1, $2, $3, $4, $5);",
        [id, patientId, file.name, base64, userId]
      );
      await db.query(
        "INSERT INTO audit_log (id, action, patient_id, user_id) VALUES ($1, $2, $3, $4);",
        [uuidv4(), "upload_report", patientId, userId]
      );
      const channel = new BroadcastChannel("carequery");
      channel.postMessage("report-update");
      resolve();
    };
    reader.onerror = () => reject(new Error("File reading error"));
    reader.readAsDataURL(file);
  });
}

export async function getReports(patientId: string) {
  const result = await db.query(
    "SELECT * FROM reports WHERE patient_id = $1;",
    [patientId]
  );
  return result.rows as Report[];
}

export async function sendReportEmail(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  patient: any,
  reports: Report[],
  email: string
) {
  const reportDetails = reports
    .map((r) => `Report: ${r.file_name} (Uploaded: ${r.uploaded_at})`)
    .join("\n");
  const message = `
    Patient: ${patient.name}
    Email: ${patient.email}
    Medical ID: ${patient.medical_id}
    Medical Condition: ${patient.medical_condition}
    Reports:
    ${reportDetails}
  `;
  await emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      to_email: email,
      message,
      patient_name: patient.name,
    },
    "YOUR_PUBLIC_KEY"
  );
}
