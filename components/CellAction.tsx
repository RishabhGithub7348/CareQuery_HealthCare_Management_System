/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/AuthContext";
import { deletePatient, getPatients } from "@/lib/patient";
import { Loader2, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import FormDialog from "./FormDialog";
import PatientForm from "./PatientForm";

export default function CellAction({
  patientId,
  onView,
  onUpdate,
  onDelete,
}: {
  patientId: string;
  onView: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}) {
  const { user } = useAuth();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const patients = await getPatients();
      const patientData = patients.find((p) => p.id === patientId);
      if (!patientData) throw new Error("Patient not found");
      setPatient(patientData);
      setUpdateOpen(true);
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

  const handleDelete = async () => {
    if (!user || user.role !== "Admin") return;
    setLoading(true);
    try {
      await deletePatient(patientId, user.id);
      toast.success("Patient deleted successfully", {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      });
      setDeleteOpen(false);
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete patient", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white shadow-md rounded-lg">
          <DropdownMenuItem
            onClick={onView}
            className="text-gray-700 hover:bg-gray-100 transition-colors duration-200 px-4 py-2"
          >
            View
          </DropdownMenuItem>
          {user?.role === "Admin" && (
            <>
              <DropdownMenuItem
                onClick={handleUpdate}
                className="text-gray-700 hover:bg-gray-100 transition-colors duration-200 px-4 py-2"
              >
                Update
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-red-600 hover:bg-red-50 transition-colors duration-200 px-4 py-2"
              >
                Delete
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <FormDialog
        open={updateOpen}
        onOpenChange={setUpdateOpen}
        title="Edit Patient"
        formComponent={
          patient && (
            <PatientForm
              patient={patient}
              onSubmit={() => {
                setUpdateOpen(false);
                onUpdate();
              }}
            />
          )
        }
      />
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this patient? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white transition-colors duration-200"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}