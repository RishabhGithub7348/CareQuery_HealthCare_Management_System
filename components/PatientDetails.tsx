/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAppointments } from "@/lib/appointment";
import { getPatients, Patient } from "@/lib/patient";
import { getReports, sendReportEmail } from "@/lib/report";
import { format } from "date-fns";
import { Loader2, Download } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppointmentForm from "./AppointmentForm";
import FormDialog from "./FormDialog";
import PatientForm from "./PatientForm";
import ReportUpload from "./ReportUpload";
import Navbar from "@/components/Navbar";

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
      toast.error(error.message || "Failed to load patient data", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
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
      toast.success("Report sent successfully", {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to send report", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">
              Patient not found
            </h2>
            <Button
              variant="outline"
              onClick={onBack}
              className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={onBack}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Back to Patients
            </Button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-blue-700 tracking-tight">
                {patient.name}
              </h2>
              <Button
                onClick={() => setPatientDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Edit Patient
              </Button>
            </div>
            <FormDialog
              open={patientDialogOpen}
              onOpenChange={(open) => {
                setPatientDialogOpen(open);
                if (!open) fetchData();
              }}
              title="Edit Patient"
              formComponent={
                <PatientForm
                  patient={patient}
                  onSubmit={() => {
                    setPatientDialogOpen(false);
                    fetchData();
                  }}
                />
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-gray-700">
                  <span className="font-semibold">Medical ID:</span>{" "}
                  {patient.medical_id}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Date of Birth:</span>{" "}
                  {format(new Date(patient.dob), "PPP")}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Medical Condition:</span>{" "}
                  {patient.medical_condition || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Email:</span>{" "}
                  {patient.email || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Contact:</span>{" "}
                  {patient.contact || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Address:</span>{" "}
                  {patient.address || "N/A"}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Created At:</span>{" "}
                  {format(new Date(patient.created_at), "PPP HH:mm:ss")}
                </p>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Appointments
            </h3>
            <Button
              onClick={() => setAppointmentDialogOpen(true)}
              className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Book New Appointment
            </Button>
            <FormDialog
              open={appointmentDialogOpen}
              onOpenChange={(open) => {
                setAppointmentDialogOpen(open);
                if (!open && formDataSubmitted) {
                  toast.success("Appointment booked successfully", {
                    position: "top-right",
                    duration: 3000,
                    className: "bg-green-500 text-white",
                  });
                  fetchData();
                }
              }}
              title="Book Appointment"
              formComponent={
                <AppointmentForm
                  patientId={patient.id}
                  onSubmit={() => setFormDataSubmitted(true)}
                />
              }
            />
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No appointments found.
                </p>
              ) : (
                appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <p className="text-gray-700">
                      <span className="font-semibold">Doctor:</span>{" "}
                      {appt.doctor_id}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Date:</span>{" "}
                      {format(new Date(appt.date), "PPP")}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Time:</span> {appt.time}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Reason:</span>{" "}
                      {appt.reason || "N/A"}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appt.status === "Scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : appt.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {appt.status}
                      </span>
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Created At:</span>{" "}
                      {format(new Date(appt.created_at), "PPP HH:mm:ss")}
                    </p>
                  </div>
                ))
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mt-8 mb-4">
              Reports
            </h3>
            <ReportUpload patientId={patientId} onUpload={() => fetchData()} />
            <div className="space-y-4 mt-4">
              {reports.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No reports found.
                </p>
              ) : (
                reports.map((report) => (
                  <div
                    key={report.id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-gray-700">
                        <span className="font-semibold">File:</span>{" "}
                        {report.file_name}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Uploaded:</span>{" "}
                        {format(new Date(report.uploaded_at), "PPP HH:mm:ss")}
                      </p>
                    </div>
                    <a
                      href={`data:application/pdf;base64,${report.file_data}`}
                      download={report.file_name}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 transition-colors duration-200"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8">
              <Label
                htmlFor="report_email"
                className="text-gray-700 font-medium"
              >
                Send Report to Email
              </Label>
              <div className="flex space-x-3 mt-2">
                <Input
                  id="report_email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
                <Button
                  onClick={handleEmailReport}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Report"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}