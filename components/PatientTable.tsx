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
import Navbar from "@/components/Navbar";

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
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 mb-6 tracking-tight">
            Patients
          </h2>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Medical Condition
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Last Booking Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Total Active Appointments
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-4 text-gray-500"
                      >
                        No patients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <TableCell className="whitespace-nowrap">
                          {patient.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {patient.medical_condition || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {patient.last_booking_date || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {patient.total_active_appointments}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <CellAction
                            patientId={patient.id}
                            onView={() =>
                              router.push(`/patients/${patient.id}`)
                            }
                            onUpdate={fetchPatients}
                            onDelete={fetchPatients}
                          />
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