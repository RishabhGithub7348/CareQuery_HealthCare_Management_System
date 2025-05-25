/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useAuth } from "@/lib/AuthContext";
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
import Navbar from "@/components/Navbar";

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
      toast.success("PDF downloaded successfully", {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } else {
      toast.error("Failed to generate PDF", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
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
      toast.success("Patient summary email sent successfully", {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
    } catch (error: any) {
      console.error("EmailJS Error:", error);
      toast.error(
        error.text ||
          error.message ||
          "Failed to send email. Check EmailJS credentials and template.",
        {
          position: "top-right",
          duration: 3000,
          className: "bg-red-500 text-white",
        }
      );
    } finally {
      setLoading(false);
    }
  };
  const {user} = useAuth()
  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    setLoading(true);
    try {
      await updateAppointment(
        selectedAppointment.id,
        { status: "Cancelled" },
        user? user?.id : ""
      );
      toast.success("Appointment cancelled successfully", {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
      setCancelDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel appointment", {
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
              onClick={() => router.push("/dashboard?tab=patients")}
              className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Back to Patients
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
              onClick={() => router.push("/dashboard?tab=patients")}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Back to Patients
            </Button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 tracking-tight">
              {patient.name}
            </h2>
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
              </div>
              <div className="flex space-x-3 md:justify-end">
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  Download PDF
                </Button>
                <Button
                  onClick={sendEmail}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Send Email Summary"
                  )}
                </Button>
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
                    Are you sure you want to cancel this appointment? This
                    action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelDialogOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelAppointment}
                    disabled={loading}
                    className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Confirm"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Time
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Doctor
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Reason
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Status
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                        No appointments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    appointments.map((appt) => (
                      <TableRow key={appt.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <TableCell>{format(new Date(appt.date), "PPP")}</TableCell>
                        <TableCell>{appt.time}</TableCell>
                        <TableCell>{appt.doctor_name || appt.doctor_id}</TableCell>
                        <TableCell>{appt.reason || "N/A"}</TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setRescheduleDialogOpen(true);
                            }}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                          >
                            Reschedule
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appt);
                              setCancelDialogOpen(true);
                            }}
                            className="ml-2 bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
