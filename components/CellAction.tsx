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
import { Loader2 } from "lucide-react";
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
      toast.error(error.message || "Failed to load patient data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!user || user.role !== "Admin") return;
    setLoading(true);
    try {
      await deletePatient(patientId, user.id);
      toast.success("Patient deleted successfully");
      setDeleteOpen(false);
      onDelete();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actions"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={onView}>View</DropdownMenuItem>
          {user?.role === "Admin" && (
            <>
              <DropdownMenuItem onClick={handleUpdate}>Update</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDeleteOpen(true)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this patient? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
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
