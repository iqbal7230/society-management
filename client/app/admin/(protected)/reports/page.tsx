"use client";

import { useEffect, useState } from "react";
import { apiGetReport, ApiReport } from "../../../lib/api";
import { getCurrentMonth } from "../../../lib/data";
import { useToast } from "../../../components/Toast";

function downloadCSV(report: ApiReport, month?: string, year?: string) {
  const title = month ? `Report_${month}` : year ? `Report_${year}` : "Report";
  const lines = [
    "Metric,Value",
    `Total Flats,${report.totalFlats}`,
    `Paid Count,${report.paidCount}`,
    `Pending Count,${report.pendingCount}`,
    `Total Collected,${report.totalCollected}`,
    `Total Pending,${report.totalPending}`,
    "",
    "Payment Mode,Total",
    ...report.byMode.map((m) => `${m.mode || "N/A"},${m.total}`),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const handlePrint = () => {
  window.print();
};

export default function AdminReportsPage() {
  const [report, setReport] = useState<ApiReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState("");
  const [mode, setMode] = useState<"month" | "year">("month");
  const { showToast } = useToast();

  const load = async () => {
    if (mode === "month" && !month) return;
    if (mode === "year" && !year) return;
    setLoading(true);
    try {
      const data = await apiGetReport(
        mode === "month" ? { month } : { year },
      );
      setReport(data);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Failed to load report", "error");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "month" && month) load();
    else if (mode === "year" && year.length === 4) load();
    else setReport(null);
  }, [mode, month, year]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Reports</h1>
      <p className="text-text-muted text-sm mb-6">
        Monthly and yearly financial reports. Download as CSV or print as PDF.
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-text-secondary">Period</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "month" | "year")}
            className="py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>
        {mode === "month" ? (
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm"
          />
        ) : (
          <input
            type="number"
            min={2020}
            max={2030}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Year (e.g. 2026)"
            className="py-2 px-4 bg-bg-input border border-border-default rounded-lg text-text-primary text-sm w-32"
          />
        )}
        {report && (
          <>
            <button
              type="button"
              onClick={() => downloadCSV(report, mode === "month" ? month : undefined, mode === "year" ? year : undefined)}
              className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-glass"
            >
              Download CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-lg border border-border-default text-text-primary text-sm font-medium hover:bg-bg-glass"
            >
              Print / PDF
            </button>
          </>
        )}
      </div>

      {loading ? (
        <p className="text-text-muted">Loading...</p>
      ) : report ? (
        <div className="bg-bg-card border border-border-default rounded-xl p-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-text-muted text-sm">Total flats</p>
              <p className="text-xl font-semibold text-text-primary">{report.totalFlats}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Paid</p>
              <p className="text-xl font-semibold text-success">{report.paidCount}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Pending</p>
              <p className="text-xl font-semibold text-warning">{report.pendingCount}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Total collected (₹)</p>
              <p className="text-xl font-semibold text-text-primary">{report.totalCollected.toLocaleString("en-IN")}</p>
            </div>
            <div>
              <p className="text-text-muted text-sm">Total pending (₹)</p>
              <p className="text-xl font-semibold text-text-primary">{report.totalPending.toLocaleString("en-IN")}</p>
            </div>
          </div>
          <div>
            <p className="text-text-muted text-sm mb-2">Payment mode breakdown</p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-default">
                  <th className="text-left py-2 text-text-secondary font-medium">Mode</th>
                  <th className="text-right py-2 text-text-secondary font-medium">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {report.byMode.map((m) => (
                  <tr key={m.mode} className="border-b border-border-default">
                    <td className="py-2 text-text-primary">{m.mode || "—"}</td>
                    <td className="py-2 text-right text-text-primary">{Number(m.total).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="text-text-muted">
          {mode === "month" ? "Select a month" : "Enter a year"} and view the report.
        </p>
      )}
    </div>
  );
}
