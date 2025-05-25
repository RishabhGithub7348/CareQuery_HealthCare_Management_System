/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/AuthContext";
import { deletePatient, getPatients } from "@/lib/patient";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function PatientList({
  onSelectPatient,
}: {
  onSelectPatient: (id: string) => void;
}) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchPatients = async () => {
    const data = await getPatients();
    setPatients(data);
  };

  useEffect(() => {
    fetchPatients();
    window.addEventListener("patient-update", fetchPatients);
    return () => window.removeEventListener("patient-update", fetchPatients);
  }, []);

  const handleDelete = async (id: string) => {
    if (user?.role !== "Admin") return;
    if (confirm("Are you sure you want to delete this patient?")) {
      await deletePatient(id, user.id);
      setPatients(patients.filter((p) => p.id !== id));
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medical_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Patients</h2>
      <Input
        placeholder="Search by name or medical ID"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Medical ID</TableHead>
            <TableHead>Date of Birth</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.medical_id}</TableCell>
              <TableCell>{format(new Date(patient.dob), "PPP")}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => onSelectPatient(patient.id)}
                  className="mr-2"
                >
                  View
                </Button>
                {user?.role === "Admin" && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(patient.id)}
                  >
                    Delete
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
