import { useState, useEffect } from "react";

interface TrainingSession {
  jadualID: number;
  tarikh: string;
  masa: string;
  jenis: string;
  lokasi: string;
  keterangan: string;
}

export function PengurusanLatihan({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrainingSessions = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const response = await fetch("/api/jadual", {
          headers: { Authorization: authHeader }
        });
        if (response.ok) {
          const data: TrainingSession[] = await response.json();
          // Filter only training sessions
          const trainings = data.filter(item => 
            String(item.jenis || "").toLowerCase().includes("latihan") || 
            String(item.keterangan || "").toLowerCase().includes("latihan")
          );
          setTrainingSessions(trainings);
        }
      } catch (error) {
        console.error("Ralat memuatkan sesi latihan:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrainingSessions();
  }, []);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return Number.isNaN(d.getTime())
      ? dateString
      : new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d);
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "-";
    return String(timeString).slice(0, 5);
  };

  const handleDelete = async (jadualID: number) => {
    const ok = window.confirm("Padam latihan ini?");
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const res = await fetch(`/api/jadual/${jadualID}`, { method: "DELETE", headers: { Authorization: authHeader } });
      if (!res.ok) {
        alert("Gagal memadam latihan.");
        return;
      }
      setTrainingSessions(prev => prev.filter(s => s.jadualID !== jadualID));
    } catch (e) {
      console.error("Ralat memadam latihan:", e);
      alert("Gagal memadam latihan.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="text-lg font-extrabold text-[#0b4a78]">Training Schedule List</div>
        <div className="mt-2 h-[3px] w-full rounded bg-[#1e67a5]" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-[#0b4a78] text-white">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-bold">Details</th>
              <th className="text-left px-4 py-3 text-sm font-bold whitespace-nowrap">Date</th>
              <th className="text-left px-4 py-3 text-sm font-bold whitespace-nowrap">Time</th>
              <th className="text-left px-4 py-3 text-sm font-bold">Location</th>
              <th className="text-left px-4 py-3 text-sm font-bold">Objective</th>
              <th className="text-center px-4 py-3 text-sm font-bold whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>Loading…</td>
              </tr>
            ) : trainingSessions.length === 0 ? (
              <tr>
                <td className="px-6 py-6 text-sm text-gray-500" colSpan={6}>No training sessions found.</td>
              </tr>
            ) : (
              trainingSessions.map((s) => (
                <tr key={s.jadualID} className="bg-white hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="font-semibold">{s.jenis}</div>
                    <div className="text-xs text-gray-500 break-words">{s.keterangan}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatDate(s.tarikh)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">{formatTime(s.masa)}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{s.lokasi || "-"}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{s.keterangan || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentPage("jadual-aktiviti")}
                        className="text-[#2563eb] hover:text-[#1d4ed8]"
                        aria-label="Edit"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 20h4l10.5-10.5a2 2 0 0 0 0-2.8l-.2-.2a2 2 0 0 0-2.8 0L5 17v3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <path d="M13.5 6.5 17.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(s.jadualID)}
                        className="text-[#dc2626] hover:text-[#b91c1c]"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <path d="M6 7l1 14h10l1-14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
