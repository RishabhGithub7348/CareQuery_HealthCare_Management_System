"use client";

import AppointmentForm from "@/components/AppointmentForm";
import PatientForm from "@/components/PatientForm";
import PatientTable from "@/components/PatientTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "patients"
  );

  useEffect(() => {
    setLoading(false);
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleActionComplete = (type: "patient" | "appointment") => {
    toast.success(
      `${type === "patient" ? "Patient" : "Appointment"} created successfully`
    );
    router.push(`/dashboard?tab=patients&${type}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 p-6">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="bg-white p-1 rounded-lg shadow-sm">
            <TabsTrigger value="create-patient" className="px-4 py-2">
              Create New Patient
            </TabsTrigger>
            <TabsTrigger value="book-appointment" className="px-4 py-2">
              Book Appointment
            </TabsTrigger>
            <TabsTrigger value="patients" className="px-4 py-2">
              Patients
            </TabsTrigger>
          </TabsList>
          <TabsContent value="create-patient">
            <PatientForm onSubmit={() => handleActionComplete("patient")} />
          </TabsContent>
          <TabsContent value="book-appointment">
            <AppointmentForm
              isDashboard={true}
              onSubmit={() => handleActionComplete("appointment")}
            />
          </TabsContent>
          <TabsContent value="patients">
            <PatientTable />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
