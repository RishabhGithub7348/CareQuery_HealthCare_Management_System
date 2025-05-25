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
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

export default function PatientList({
  onSelectPatient,
}: {
  onSelectPatient: (id: string) => void;
}) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatients();
      setPatients(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load patients", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
    window.addEventListener("patient-update", fetchPatients);
    return () => window.removeEventListener("patient-update", fetchPatients);
  }, []);

  const handleDelete = async (id: string) => {
    if (user?.role !== "Admin") return;
    if (window.confirm("Are you sure you want to delete this patient?")) {
      try {
        await deletePatient(id, user.id);
        setPatients(patients.filter((p) => p.id !== id));
        toast.success("Patient deleted successfully", {
          position: "top-right",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to delete patient", {
          position: "top-right",
          duration: 3000,
          className: "bg-red-500 text-white",
        });
      }
    }
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medical_id.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search by name or medical ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
            />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Medical ID
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Date of Birth
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-4 text-gray-500"
                      >
                        No patients found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPatients.map((patient) => (
                      <TableRow
                        key={patient.id}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <TableCell className="whitespace-nowrap">
                          {patient.name}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {patient.medical_id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(patient.dob), "PPP")}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSelectPatient(patient.id)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200 mr-2"
                          >
                            View
                          </Button>
                          {user?.role === "Admin" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(patient.id)}
                              className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
                            >
                              Delete
                            </Button>
                          )}
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