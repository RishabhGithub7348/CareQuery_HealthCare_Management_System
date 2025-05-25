/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Import Card components
import { useAuth } from "@/lib/AuthContext";
import { createPatient, Patient, updatePatient } from "@/lib/patient";
import { format } from "date-fns";
import { AlertTriangle, Loader2 } from "lucide-react"; // Added AlertTriangle for error
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
    if (!user) {
      toast.error("You must be logged in to perform this action.", {
        position: "top-right",
      });
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (formData.dob && !/^\d{4}-\d{2}-\d{2}$/.test(formData.dob)) {
        // This specific check might be redundant if type="date" input handles it,
        // but good for explicit validation before API call.
        throw new Error("Invalid date of birth format. Please use YYYY-MM-DD.");
      }

      let id: string;
      if (patient) {
        await updatePatient(patient.id, formData, user.id);
        id = patient.id;
        toast.success("Patient details updated successfully!", {
          position: "top-right",
          // Consider using shadcn/ui theme colors for toasts if available
          // e.g., className: "bg-green-100 border-green-500 text-green-700"
        });
      } else {
        id = await createPatient(formData as Patient, user.id); // Ensure all required fields for Patient are present
        toast.success("New patient created successfully!", {
          position: "top-right",
        });
      }
      if (onSubmit) onSubmit(id);
      // Optionally reset form if it's a create form and not an update
      // if (!patient) {
      //   setFormData({ name: "", email: "", ... });
      // }
    } catch (err: any) {
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto my-8 shadow-lg dark:bg-slate-800">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
          {patient ? "Edit Patient Information" : "Register New Patient"}
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          {patient
            ? "Update the details for this patient below."
            : "Please fill in all required fields to create a new patient record."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-slate-700 dark:text-slate-300">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
              placeholder="e.g., Johnathan Doe"
            />
          </div>

          {/* Email & Contact - Side by side on medium screens and up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
                placeholder="e.g., patient@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact" className="font-medium text-slate-700 dark:text-slate-300">
                Contact Number
              </Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) =>
                  setFormData({ ...formData, contact: e.target.value })
                }
                className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
                placeholder="e.g., (555) 123-4567"
              />
            </div>
          </div>

          {/* Address Field */}
          <div className="space-y-2">
            <Label htmlFor="address" className="font-medium text-slate-700 dark:text-slate-300">
              Full Address
            </Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
              placeholder="e.g., 123 Main St, Anytown, STATE 12345"
            />
          </div>

          {/* Medical Condition Field */}
          <div className="space-y-2">
            <Label htmlFor="medical_condition" className="font-medium text-slate-700 dark:text-slate-300">
              Primary Medical Condition(s)
            </Label>
            <Input // Consider using <Textarea /> from shadcn/ui if this can be lengthy
              id="medical_condition"
              value={formData.medical_condition}
              onChange={(e) =>
                setFormData({ ...formData, medical_condition: e.target.value })
              }
              className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
              placeholder="e.g., Hypertension, Diabetes Type 2, Asthma"
            />
          </div>

          {/* Medical ID & DOB - Side by side on medium screens and up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="space-y-2">
              <Label htmlFor="medical_id" className="font-medium text-slate-700 dark:text-slate-300">
                Medical ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="medical_id"
                value={formData.medical_id}
                onChange={(e) =>
                  setFormData({ ...formData, medical_id: e.target.value })
                }
                required
                className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
                placeholder="e.g., PATID00123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob" className="font-medium text-slate-700 dark:text-slate-300">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                required
                className="dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600 dark:[color-scheme:dark]" // Crucial for date picker icon in dark mode
                max={format(new Date(), "yyyy-MM-dd")} // Prevent future dates
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-x-2 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/30 p-3 rounded-md mt-4">
              <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-medium text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold py-3 rounded-md shadow-md hover:shadow-lg transition-all duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 mt-8" // Added more top margin
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>{patient ? "Save Changes" : "Create Patient Record"}</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}