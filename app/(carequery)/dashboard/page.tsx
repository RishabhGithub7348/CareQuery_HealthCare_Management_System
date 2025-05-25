"use client";

import AppointmentForm from "@/components/AppointmentForm";
import PatientForm from "@/components/PatientForm";
import PatientTable from "@/components/PatientTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";

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
      `${type === "patient" ? "Patient" : "Appointment"} created successfully`,
      {
        position: "top-right",
        duration: 3000,
        className: "bg-green-500 text-white",
      }
    );
    router.push(`/dashboard?tab=patients&${type}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 md:p-8">
        {loading ? (
          <div className="flex justify-center items-center h-[calc(100vh-64px)]">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-blue-700 mb-6 tracking-tight">
              CareQuery Dashboard
            </h1>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="bg-gray-100 p-1.5 rounded-xl shadow-md flex space-x-2">
                <TabsTrigger
                  value="create-patient"
                  className="flex-1 px-4 py-3 text-gray-700 font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200 transition-all duration-200"
                >
                  Create Patient
                </TabsTrigger>
                <TabsTrigger
                  value="book-appointment"
                  className="flex-1 px-4 py-3 text-gray-700 font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200 transition-all duration-200"
                >
                  Book Appointment
                </TabsTrigger>
                <TabsTrigger
                  value="patients"
                  className="flex-1 px-4 py-3 text-gray-700 font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-sm hover:bg-gray-200 transition-all duration-200"
                >
                  Patients
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="create-patient"
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <PatientForm onSubmit={() => handleActionComplete("patient")} />
              </TabsContent>
              <TabsContent
                value="book-appointment"
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <AppointmentForm
                  isDashboard={true}
                  onSubmit={() => handleActionComplete("appointment")}
                />
              </TabsContent>
              <TabsContent
                value="patients"
                className="bg-white p-6 rounded-xl shadow-md"
              >
                <PatientTable />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}