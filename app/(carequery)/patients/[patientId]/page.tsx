/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import AppointmentForm from "@/components/AppointmentForm";
import FormDialog from "@/components/FormDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Appointment,
  getAppointments,
  updateAppointment,
} from "@/lib/appointment";
import { getPatients, Patient } from "@/lib/patient";
import emailjs from "@emailjs/browser";
import { format } from "date-fns";
import { jsPDF } from "jspdf";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export default function PatientDetails({
  params,
}: {
  params: Promise<{ patientId: string }>;
}) {
  const router = useRouter();
  const { patientId } = use(params);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const patients = await getPatients();
      const patientData = patients.find((p) => p.id === patientId);
      if (!patientData) throw new Error("Patient not found");
      setPatient(patientData);
      const appts = await getAppointments(patientId);
      setAppointments(appts);
    } catch (error: any) {
      toast.error(error.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
    const channel = new BroadcastChannel("carequery-updates");
    channel.onmessage = (event) => {
      if (
        event.data.type === "patient-update" ||
        event.data.type === "appointment-update"
      ) {
        fetchData();
      }
    };
    window.addEventListener("patient-update", fetchData);
    window.addEventListener("appointment-update", fetchData);
    return () => {
      channel.close();
      window.removeEventListener("patient-update", fetchData);
      window.removeEventListener("appointment-update", fetchData);
    };
  }, [fetchData]);

  const generatePDF = () => {
    if (!patient) return null;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Patient Summary", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${patient.name}`, 20, 40);
    doc.text(`Medical ID: ${patient.medical_id}`, 20, 50);
    doc.text(`Date of Birth: ${format(new Date(patient.dob), "PPP")}`, 20, 60);
    doc.text(
      `Medical Condition: ${patient.medical_condition || "N/A"}`,
      20,
      70
    );
    doc.text(`Email: ${patient.email || "N/A"}`, 20, 80);
    doc.text(`Contact: ${patient.contact || "N/A"}`, 20, 90);
    doc.text(`Address: ${patient.address || "N/A"}`, 20, 100);
    doc.text("Appointments:", 20, 120);
    appointments.forEach((appt, index) => {
      doc.text(
        `${index + 1}. ${format(new Date(appt.date), "PPP")} at ${appt.time} - ${appt.reason || "N/A"} (${appt.status})`,
        20,
        130 + index * 10
      );
    });
    return doc.output("blob");
  };

  const handleDownloadPDF = () => {
    const pdfBlob = generatePDF();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${patient?.name}_summary.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully");
    } else {
      toast.error("Failed to generate PDF");
    }
  };

  const sendEmail = async () => {
    if (!patient) return;
    setLoading(true);
    try {
      const appointmentList = appointments.map((appt, index) => ({
        row_index: index,
        date: format(new Date(appt.date), "PPP"),
        time: appt.time,
        doctor: appt.doctor_name || appt.doctor_id,
        reason: appt.reason || "N/A",
        status: appt.status,
      }));

      const templateParams = {
        to_email: patient.email,
        patient_name: patient.name,
        medical_id: patient.medical_id,
        dob: format(new Date(patient.dob), "PPP"),
        medical_condition: patient.medical_condition || "N/A",
        email: patient.email || "N/A",
        contact: patient.contact || "N/A",
        address: patient.address || "N/A",
        appointments: appointmentList,
        current_date: format(new Date(), "PPP"),
      };

      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );
      toast.success("Patient summary email sent successfully");
    } catch (error: any) {
      console.error("EmailJS Error:", error);
      toast.error(
        error.text ||
          error.message ||
          "Failed to send email. Check EmailJS credentials and template."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    try {
      await updateAppointment(
        selectedAppointment.id,
        { status: "Cancelled" },
        "user-id-placeholder"
      );
      toast.success("Appointment cancelled successfully");
      setCancelDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel appointment");
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
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 p-6">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard?tab=patients")}
        className="mb-4"
      >
        Back to Patients
      </Button>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-blue-600 mb-4">{patient.name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <strong>Medical ID:</strong> {patient.medical_id}
            </p>
            <p>
              <strong>Date of Birth:</strong>{" "}
              {format(new Date(patient.dob), "PPP")}
            </p>
            <p>
              <strong>Medical Condition:</strong>{" "}
              {patient.medical_condition || "N/A"}
            </p>
            <p>
              <strong>Email:</strong> {patient.email || "N/A"}
            </p>
            <p>
              <strong>Contact:</strong> {patient.contact || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {patient.address || "N/A"}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleDownloadPDF}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Download PDF
            </Button>
            <Button
              onClick={sendEmail}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Email Summary"
              )}
            </Button>
          </div>
        </div>
        <h3 className="text-lg font-semibold mt-6">Appointments</h3>
        <Button
          onClick={() => setAppointmentDialogOpen(true)}
          className="my-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          Book New Appointment
        </Button>
        <FormDialog
          open={appointmentDialogOpen}
          onOpenChange={setAppointmentDialogOpen}
          title="Book Appointment"
          formComponent={
            <AppointmentForm
              patientId={patient.id}
              onSubmit={() => {
                setAppointmentDialogOpen(false);
                fetchData();
              }}
            />
          }
        />
        <FormDialog
          open={rescheduleDialogOpen}
          onOpenChange={setRescheduleDialogOpen}
          title="Reschedule Appointment"
          formComponent={
            selectedAppointment && (
              <AppointmentForm
                appointment={selectedAppointment}
                patientId={patient.id}
                onSubmit={() => {
                  setRescheduleDialogOpen(false);
                  fetchData();
                }}
              />
            )
          }
        />
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancelAppointment}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appt) => (
              <TableRow key={appt.id}>
                <TableCell>{format(new Date(appt.date), "PPP")}</TableCell>
                <TableCell>{appt.time}</TableCell>
                <TableCell>{appt.doctor_name || appt.doctor_id}</TableCell>
                <TableCell>{appt.reason || "N/A"}</TableCell>
                <TableCell>{appt.status}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setRescheduleDialogOpen(true);
                    }}
                  >
                    Reschedule
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setCancelDialogOpen(true);
                    }}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
