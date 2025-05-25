"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAppointments } from "@/lib/appointment";
import { getPatients } from "@/lib/patient";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import CellAction from "./CellAction";

interface Patient {
  id: string;
  name: string;
  medical_condition: string;
  last_booking_date: string | null;
  total_active_appointments: number;
}

export default function PatientTable() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const patientsData = await getPatients();
      const patientsWithAppointments = await Promise.all(
        patientsData.map(async (patient) => {
          const appointments = await getAppointments(patient.id);
          const activeAppointments = appointments.filter(
            (appt) => appt.status === "Scheduled"
          );
          const lastBooking = activeAppointments.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];
          return {
            ...patient,
            last_booking_date: lastBooking
              ? format(new Date(lastBooking.date), "PPP")
              : null,
            total_active_appointments: activeAppointments.length,
          };
        })
      );
      setPatients(patientsWithAppointments);
    } catch (error) {
      console.error("Failed to fetch patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
    const channel = new BroadcastChannel("carequery-updates");
    channel.onmessage = (event) => {
      if (
        event.data.type === "patient-update" ||
        event.data.type === "appointment-update"
      ) {
        fetchPatients();
      }
    };
    return () => {
      channel.close();
    };
  }, [fetchPatients]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Patients</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Medical Condition</TableHead>
            <TableHead>Last Booking Date</TableHead>
            <TableHead>Total Active Appointments</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.medical_condition}</TableCell>
              <TableCell>{patient.last_booking_date || "N/A"}</TableCell>
              <TableCell>{patient.total_active_appointments}</TableCell>
              <TableCell>
                <CellAction
                  patientId={patient.id}
                  onView={() => router.push(`/patients/${patient.id}`)}
                  onUpdate={fetchPatients}
                  onDelete={fetchPatients}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
