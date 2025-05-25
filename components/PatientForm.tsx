/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { createPatient, Patient, updatePatient } from "@/lib/patient";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function PatientForm({
  patient,
  onSubmit,
}: {
  patient?: Patient;
  onSubmit?: (id: string) => void;
}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: patient?.name || "",
    email: patient?.email || "",
    contact: patient?.contact || "",
    address: patient?.address || "",
    medical_condition: patient?.medical_condition || "",
    medical_id: patient?.medical_id || "",
    dob: patient?.dob ? format(new Date(patient.dob), "yyyy-MM-dd") : "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      if (formData.dob && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
        throw new Error("Invalid date of birth format");
      }
      let id: string;
      if (patient) {
        await updatePatient(patient.id, formData, user.id);
        id = patient.id;
        toast.success("Patient updated successfully");
      } else {
        id = await createPatient(formData as Patient, user.id);
        toast.success("Patient created successfully");
      }
      if (onSubmit) onSubmit(id);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "Failed to save patient");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold text-blue-600 mb-4">
        {patient ? "Edit Patient" : "Create New Patient"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            value={formData.contact}
            onChange={(e) =>
              setFormData({ ...formData, contact: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="medical_condition">Medical Condition</Label>
          <Input
            id="medical_condition"
            value={formData.medical_condition}
            onChange={(e) =>
              setFormData({ ...formData, medical_condition: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="medical_id">Medical ID</Label>
          <Input
            id="medical_id"
            value={formData.medical_id}
            onChange={(e) =>
              setFormData({ ...formData, medical_id: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : patient ? (
            "Update"
          ) : (
            "Create"
          )}
        </Button>
      </form>
    </div>
  );
}
