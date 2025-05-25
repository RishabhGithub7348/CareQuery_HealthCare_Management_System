/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Appointment,
  createAppointment,
  getDoctors,
  updateAppointment,
} from "@/lib/appointment";
import { useAuth } from "@/lib/AuthContext";
import { getPatients } from "@/lib/patient";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface AppointmentFormProps {
  patientId?: string; // Optional for dashboard
  isDashboard?: boolean; // Show patient dropdown on dashboard
  appointment?: Appointment;
  onSubmit: () => void;
}

export default function AppointmentForm({
  patientId,
  isDashboard = false,
  appointment,
  onSubmit,
}: AppointmentFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    patient_id: patientId || "",
    doctor_id: appointment?.doctor_id || "",
    date: appointment?.date || format(new Date(), "yyyy-MM-dd"),
    time: appointment?.time || "",
    reason: appointment?.reason || "",
    status: appointment?.status || "Scheduled",
  });
  const [doctors, setDoctors] = useState<
    { id: string; name: string; specialty: string }[]
  >([]);
  const [patients, setPatients] = useState<
    { id: string; name: string; medical_id: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  // Predefined time slots (9:00 AM to 5:00 PM, 30-minute intervals)
  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const doctorList = await getDoctors();
        setDoctors(doctorList);
        if (isDashboard) {
          const patientList = await getPatients();
          setPatients(patientList);
        }
      } catch (error: any) {
        toast.error("Failed to load data", {
          position: "top-right",
          duration: 3000,
          className: "bg-red-500 text-white",
        });
        console.log(error);
      }
    }
    fetchData();
  }, [isDashboard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const selectedPatientId = formData.patient_id || patientId;
      if (!selectedPatientId) {
        throw new Error("Please select a patient");
      }
      if (appointment?.id) {
        // Reschedule: Update existing appointment
        await updateAppointment(
          appointment.id,
          {
            doctor_id: formData.doctor_id,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
            status: formData.status,
          },
          user ? user.id : ""
        );
        toast.success("Appointment rescheduled successfully", {
          position: "top-right",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } else {
        // Create new appointment
        await createAppointment(
          {
            patient_id: selectedPatientId,
            doctor_id: formData.doctor_id,
            date: formData.date,
            time: formData.time,
            reason: formData.reason,
            status: formData.status,
          },
          user ? user.id : ""
        );
        toast.success("Appointment booked successfully", {
          position: "top-right",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      }
      onSubmit();
    } catch (error: any) {
      toast.error(error.message || "Failed to save appointment", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
      {isDashboard && (
        <div className="space-y-2">
          <Label htmlFor="patient" className="text-gray-700 font-medium">
            Patient
          </Label>
          <Select
            value={formData.patient_id}
            onValueChange={(value) =>
              setFormData({ ...formData, patient_id: value })
            }
          >
            <SelectTrigger
              id="patient"
              className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
            >
              <SelectValue placeholder="Select a patient" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.medical_id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="doctor" className="text-gray-700 font-medium">
          Doctor
        </Label>
        <Select
          value={formData.doctor_id}
          onValueChange={(value) =>
            setFormData({ ...formData, doctor_id: value })
          }
        >
          <SelectTrigger
            id="doctor"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
          >
            <SelectValue placeholder="Select a doctor" />
          </SelectTrigger>
          <SelectContent>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                {doctor.name} ({doctor.specialty})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date" className="text-gray-700 font-medium">
          Date
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
              {formData.date
                ? format(new Date(formData.date), "PPP")
                : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={new Date(formData.date)}
              onSelect={(date) =>
                setFormData({
                  ...formData,
                  date: date ? format(date, "yyyy-MM-dd") : formData.date,
                })
              }
              initialFocus
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="space-y-2">
        <Label htmlFor="time" className="text-gray-700 font-medium">
          Time
        </Label>
        <Select
          value={formData.time}
          onValueChange={(value) => setFormData({ ...formData, time: value })}
        >
          <SelectTrigger
            id="time"
            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
          >
            <SelectValue placeholder="Select a time" />
          </SelectTrigger>
          <SelectContent>
            {timeSlots.map((slot) => (
              <SelectItem key={slot} value={slot}>
                {slot}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reason" className="text-gray-700 font-medium">
          Reason
        </Label>
        <Input
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Reason for appointment"
          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : appointment?.id ? (
          "Reschedule Appointment"
        ) : (
          "Book Appointment"
        )}
      </Button>
    </form>
  );
}