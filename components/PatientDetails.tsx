/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppointments } from "@/lib/appointment";
import { getPatients, Patient } from "@/lib/patient";
import { getReports, sendReportEmail } from "@/lib/report";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";
import FormDialog from "./FormDialog";
import PatientForm from "./PatientForm";
import ReportUpload from "./ReportUpload";

export default function PatientDetails({
  patientId,
  onBack,
}: {
  patientId: string;
  onBack: () => void;
}) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const patients = await getPatients();
      const patientData = patients.find((p) => p.id === patientId);
      if (!patientData) throw new Error("Patient not found");
      setPatient(patientData);
      setEmail(patientData?.email || "");
      const appts = await getAppointments(patientId);
      setAppointments(appts);
      const rpts = await getReports(patientId);
      setReports(rpts);
    } catch (error: any) {
      toast.error(error.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const [formDataSubmitted, setFormDataSubmitted] = useState<boolean>();
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current();
  }, [patientId]);

  const handleEmailReport = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      await sendReportEmail(patient, reports, email);
      toast.success("Report sent successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to send report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!patient) return <div>Patient not found</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Button variant="outline" onClick={onBack} className="mb-4">
        Back
      </Button>
      <h2 className="text-xl font-bold text-blue-600 mb-4">{patient.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p>
            <strong>Email:</strong> {patient.email}
          </p>
          <p>
            <strong>Contact:</strong> {patient.contact}
          </p>
          <p>
            <strong>Address:</strong> {patient.address}
          </p>
          <p>
            <strong>Medical Condition:</strong> {patient.medical_condition}
          </p>
          <p>
            <strong>Medical ID:</strong> {patient.medical_id}
          </p>
          <p>
            <strong>Date of Birth:</strong>{" "}
            {format(new Date(patient.dob), "PPP")}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {format(new Date(patient.created_at), "PPP HH:mm:ss")}
          </p>
        </div>
        <div>
          <Button
            onClick={() => setPatientDialogOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            Edit Patient
          </Button>
          <FormDialog
            open={patientDialogOpen}
            onOpenChange={setPatientDialogOpen}
            title="Edit Patient"
            formComponent={
              <PatientForm
                patient={patient}
                onSubmit={() => setPatientDialogOpen(false)}
              />
            }
          />
        </div>
      </div>
      <h3 className="text-lg font-semibold mt-4">Appointments</h3>
      <Button
        onClick={() => setAppointmentDialogOpen(true)}
        className="my-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
      >
        Book New Appointment
      </Button>
      <FormDialog
        open={appointmentDialogOpen}
        onOpenChange={(open) => {
          setAppointmentDialogOpen(open);
          if (!open && formDataSubmitted)
            toast.success("Appointment booked successfully");
        }}
        title="Book Appointment"
        formComponent={
          <AppointmentForm
            patientId={patient.id}
            onSubmit={() => setFormDataSubmitted(true)}
          />
        }
      />
      <div className="mt-4">
        {appointments.map((appt) => (
          <div key={appt.id} className="border p-2 mb-2">
            <p>
              <strong>Doctor:</strong> {appt.doctor_id}
            </p>
            <p>
              <strong>Date:</strong> {format(new Date(appt.date), "PPP")}
            </p>
            <p>
              <strong>Time:</strong> {appt.time}
            </p>
            <p>
              <strong>Reason:</strong> {appt.reason || "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {appt.status}
            </p>
            <p>
              <strong>Created At:</strong>{" "}
              {format(new Date(appt.created_at), "PPP HH:mm:ss")}
            </p>
          </div>
        ))}
      </div>
      <h3 className="text-lg font-semibold mt-4">Reports</h3>
      <ReportUpload patientId={patientId} onUpload={() => fetchData()} />
      <div className="mt-4">
        {reports.map((report) => (
          <div key={report.id} className="border p-2 mb-2">
            <p>
              <strong>File:</strong> {report.file_name}
            </p>
            <p>
              <strong>Uploaded:</strong>{" "}
              {format(new Date(report.uploaded_at), "PPP HH:mm:ss")}
            </p>
            <a
              href={`data:application/pdf;base64,${report.file_data}`}
              download={report.file_name}
            >
              Download
            </a>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <Label htmlFor="report_email">Send Report to Email</Label>
        <div className="flex space-x-2">
          <Input
            id="report_email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
          <Button
            onClick={handleEmailReport}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Report"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
