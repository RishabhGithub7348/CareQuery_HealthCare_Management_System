/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/AuthContext";
import db from "@/lib/db";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function SQLPage() {
  const router = useRouter();
  const { user } = useAuth();
  const queryInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [table, setTable] = useState("");
  const [filterColumn, setFilterColumn] = useState("");
  const [filterOperator, setFilterOperator] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Admin check
  useEffect(() => {
    if (!user || user.role !== "Admin") {
      toast.error(
        "Only Admin has privilege to access this, please login by Admin"
      );
      router.push("/auth");
    }
  }, [user, router]);

  // Table columns for dropdowns
  const tableColumns: Record<string, string[]> = {
    patients: [
      "id",
      "name",
      "medical_id",
      "dob",
      "medical_condition",
      "email",
      "contact",
      "address",
    ],
    appointments: [
      "id",
      "patient_id",
      "doctor_id",
      "date",
      "time",
      "reason",
      "status",
      "created_at",
    ],
    users: ["id", "username", "role", "created_at"],
  };

  const operators = ["=", "LIKE", ">", "<", ">=", "<="];

  const handleExecute = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await db.query<Record<string, any>>(query);
      if (result.rows && result.fields) {
        const dateFields = [
          "dob",
          "date",
          "created_at",
          "uploaded_at",
          "timestamp",
        ];
        const formattedRows = result.rows.map((row) => {
          const formattedRow: Record<string, any> = { ...row };
          dateFields.forEach((field) => {
            if (field in row && row[field] instanceof Date) {
              formattedRow[field] = format(
                row[field],
                field === "dob" || field === "date"
                  ? "yyyy-MM-dd"
                  : "yyyy-MM-dd HH:mm:ss"
              );
            }
          });
          return formattedRow;
        });
        setColumns(result.fields.map((field: any) => field.name));
        setResults(formattedRows);
        toast.success("Query executed successfully");
      } else {
        setColumns([]);
        setResults([]);
        toast.success("Query executed successfully (no results)");
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
      toast.error(err.message || "Failed to execute query");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuery = () => {
    if (!table) {
      toast.error("Please select a table");
      return;
    }
    let generatedQuery = `SELECT * FROM ${table}`;
    if (filterColumn && filterOperator && filterValue) {
      const value =
        filterOperator === "LIKE" ? `'%${filterValue}%'` : `'${filterValue}'`;
      generatedQuery += ` WHERE ${filterColumn} ${filterOperator} ${value}`;
    }
    if (sortColumn) {
      generatedQuery += ` ORDER BY ${sortColumn} ${sortOrder}`;
    }
    setQuery(generatedQuery);
    queryInputRef.current?.focus();
  };

  const handleDownloadCSV = () => {
    if (!results.length || !columns.length) {
      toast.error("No results to download");
      return;
    }
    const csvRows = [
      columns.join(","),
      ...results.map((row) =>
        columns
          .map(
            (col) => `"${(row[col] ?? "NULL").toString().replace(/"/g, '""')}"`
          )
          .join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `query_results_${new Date().toISOString()}.csv`
    );
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearTable = () => {
    setTable("");
    setFilterColumn("");
    setFilterOperator("");
    setFilterValue("");
    setSortColumn("");
    setSortOrder("ASC");
    setQuery("");
  };

  const clearFilter = () => {
    setFilterColumn("");
    setFilterOperator("");
    setFilterValue("");
  };

  const clearSort = () => {
    setSortColumn("");
    setSortOrder("ASC");
  };

  // Render Admin error if not Admin
  if (!user || user.role !== "Admin") {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-gray-100 p-6">
      <Button
        variant="outline"
        onClick={() => router.push("/dashboard")}
        className="mb-4"
      >
        Back to Dashboard
      </Button>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Raw SQL Query</h2>
        <div className="space-y-4">
          <Input
            ref={queryInputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter or generate your SQL query"
            className="font-mono"
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleExecute}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Execute Query"
              )}
            </Button>
            <Button
              onClick={handleGenerateQuery}
              variant="outline"
              disabled={loading}
            >
              Generate Query
            </Button>
            {results.length > 0 && (
              <Button
                onClick={handleDownloadCSV}
                variant="outline"
                disabled={loading}
              >
                Download as CSV
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Table Selection</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearTable}
                  disabled={loading}
                >
                  Clear
                </Button>
              </div>
              <Select value={table} onValueChange={setTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patients">Patients</SelectItem>
                  <SelectItem value="appointments">Appointments</SelectItem>
                  <SelectItem value="users">Users</SelectItem>
                </SelectContent>
              </Select>
              {table && (
                <Button
                  onClick={() => setQuery(`SELECT * FROM ${table}`)}
                  variant="outline"
                  className="mt-2"
                >
                  Get All Columns
                </Button>
              )}
            </div>
            {table && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Filter By</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearFilter}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Select value={filterColumn} onValueChange={setFilterColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableColumns[table].map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterOperator}
                    onValueChange={setFilterOperator}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Operator" />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map((op) => (
                        <SelectItem key={op} value={op}>
                          {op}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="Value"
                  />
                </div>
              </div>
            )}
            {table && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">Sort By</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSort}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Select value={sortColumn} onValueChange={setSortColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Column" />
                    </SelectTrigger>
                    <SelectContent>
                      {tableColumns[table].map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={setSortOrder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ASC">Ascending</SelectItem>
                      <SelectItem value="DESC">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {columns.length > 0 && (
            <div className="max-w-[75vw] overflow-y-auto overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead
                        key={col}
                        className="sticky top-0 bg-white z-10"
                      >
                        {col.toUpperCase()}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((col) => (
                        <TableCell key={col}>{row[col] ?? "NULL"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
