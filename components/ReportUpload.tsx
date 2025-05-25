"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { uploadReport } from "@/lib/report";
import { useState } from "react";

export default function ReportUpload({
  patientId,
  onUpload,
}: {
  patientId: string;
  onUpload: () => void;
}) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !user) return;
    setError("");
    setLoading(true);
    try {
      await uploadReport(file, patientId, user.id);
      setFile(null);
      onUpload();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to upload report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="report">Upload Report (PDF)</Label>
      <Input
        id="report"
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button
        onClick={handleUpload}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        disabled={!file || loading}
      >
        {loading ? "Uploading..." : "Upload Report"}
      </Button>
    </div>
  );
}
