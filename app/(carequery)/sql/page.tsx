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
import Navbar from "@/components/Navbar";

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
        "Only Admin has privilege to access this, please login by Admin",
        {
          position: "top-right",
          duration: 3000,
          className: "bg-red-500 text-white",
        }
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
        toast.success("Query executed successfully", {
          position: "top-right",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      } else {
        setColumns([]);
        setResults([]);
        toast.success("Query executed successfully (no results)", {
          position: "top-right",
          duration: 3000,
          className: "bg-green-500 text-white",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to execute query");
      toast.error(err.message || "Failed to execute query", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuery = () => {
    if (!table) {
      toast.error("Please select a table", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
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
      toast.error("No results to download", {
        position: "top-right",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              Back to Dashboard
            </Button>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 tracking-tight">
              SQL Query Interface
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col gap-4">
                <Input
                  ref={queryInputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter or generate your SQL query"
                  className="font-mono text-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={handleExecute}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Execute Query"
                    )}
                  </Button>
                  <Button
                    onClick={handleGenerateQuery}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    disabled={loading}
                  >
                    Generate Query
                  </Button>
                  {results.length > 0 && (
                    <Button
                      onClick={handleDownloadCSV}
                      variant="outline"
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      disabled={loading}
                    >
                      Download as CSV
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Table Selection
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearTable}
                      className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      disabled={loading}
                    >
                      Clear
                    </Button>
                  </div>
                  <Select value={table} onValueChange={setTable}>
                    <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
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
                      className="mt-3 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      Get All Columns
                    </Button>
                  )}
                </div>
                {table && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Filter By
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilter}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <Select
                        value={filterColumn}
                        onValueChange={setFilterColumn}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                          <SelectValue placeholder="Select column" />
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
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                          <SelectValue placeholder="Select operator" />
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
                        placeholder="Enter value"
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                      />
                    </div>
                  </div>
                )}
                {table && (
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Sort By
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSort}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        disabled={loading}
                      >
                        Clear
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Select
                        value={sortColumn}
                        onValueChange={setSortColumn}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                          <SelectValue placeholder="Select column" />
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
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200">
                          <SelectValue placeholder="Select order" />
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
              {error && (
                <p className="text-red-500 text-sm font-medium">{error}</p>
              )}
              {columns.length > 0 && (
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        {columns.map((col) => (
                          <TableHead
                            key={col}
                            className="font-semibold text-gray-700 whitespace-nowrap"
                          >
                            {col.toUpperCase()}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="text-center py-4 text-gray-500"
                          >
                            No results found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        results.map((row, index) => (
                          <TableRow
                            key={index}
                            className="hover:bg-gray-50 transition-colors duration-200"
                          >
                            {columns.map((col) => (
                              <TableCell key={col} className="whitespace-nowrap">
                                {row[col] ?? "NULL"}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}