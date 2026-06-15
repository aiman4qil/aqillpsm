import { apiFetch } from "../utils/api";
import { useState, useEffect } from "react";

interface CoachDashboardProps {
  setCurrentPage: (page: string) => void;
  handleLogout: () => void;
}

interface DashboardData {
  topPlayer: { nama: string; rating: string | number };
  teamStats: { goals: number; matches: number };
  attendance: { total: number; present: number };
  lineup: {
    GK: { nama: string; rating: string }[];
    Fixo: { nama: string; rating: string }[];
    Ala: { nama: string; rating: string }[];
    Pivot: { nama: string; rating: string }[];
  };
}

export function CoachDashboard({ setCurrentPage, handleLogout }: CoachDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await apiFetch("/api/dashboard/coach", {
          headers: { Authorization: token ? "Bearer " + token : "" },
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error("Ralat memuatkan dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Helper to format rating
  const fmt = (val: string | number) => Number(val).toFixed(1);
  // Helper for percentage
  const attPct = data ? (data.attendance.total > 0 ? Math.round((data.attendance.present / data.attendance.total) * 100) : 0) : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Selamat Datang, Jurulatih</h1>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        {loading ? (
          <div className="p-12 text-center text-xl text-gray-600 animate-pulse">Memuatkan data dashboard...</div>
        ) : (
          <>
            <div className="p-6 border-b-2 border-gray-800">
              <h2 className="uppercase mb-4 text-xl font-bold underline">Prestasi Terkini</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center transform hover:scale-105 transition-transform">
                  <div className="mb-2 font-bold text-lg">⭐ Pemain Terbaik</div>
                  <div className="text-2xl font-black text-blue-800">{data?.topPlayer.nama}</div>
                  <div className="text-sm text-gray-600 mt-2 font-mono bg-white inline-block px-2 rounded border border-gray-300">
                    Rating: {fmt(data?.topPlayer.rating || 0)}{"/10"}
                  </div>
                </div>
                <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center transform hover:scale-105 transition-transform">
                  <div className="mb-2 font-bold text-lg">⚽ Statistik Pasukan</div>
                  <div className="text-3xl font-black text-green-800">{data?.teamStats.matches}</div>
                  <div className="text-sm text-gray-600">Perlawanan</div>
                  <div className="mt-2 text-xl font-bold">{data?.teamStats.goals} <span className="text-sm font-normal text-gray-600">Gol</span></div>
                </div>
                <div className="bg-gray-100 border-2 border-gray-800 rounded p-6 text-center transform hover:scale-105 transition-transform">
                  <div className="mb-2 font-bold text-lg">📅 Kehadiran Latihan</div>
                  <div className="text-3xl font-black text-purple-800">{attPct}%</div>
                  <div className="text-sm text-gray-600 mt-2">
                    {data?.attendance.present} / {data?.attendance.total} sesi
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h2 className="uppercase mb-4 text-xl font-bold underline">Cadangan Kesebelasan Utama (Prestasi Tertinggi)</h2>
              <div className="space-y-3 bg-white p-6 border-2 border-gray-800 rounded shadow-inner">
                {/* GK */}
                {data?.lineup.GK.map((p, i) => (
                  <div key={"gk-" + i} className="flex items-center gap-4 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400 shadow-sm">
                    <span className="font-bold bg-yellow-400 text-black px-3 py-1 rounded shadow text-sm w-16 text-center">GK</span>
                    <span className="flex-grow font-bold text-lg">{p.nama}</span>
                    <span className="font-mono font-bold text-xl bg-white px-3 py-1 rounded border">{fmt(p.rating)}</span>
                  </div>
                ))}
                
                {/* Fixo */}
                {data?.lineup.Fixo.map((p, i) => (
                  <div key={"fixo-" + i} className="flex items-center gap-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400 shadow-sm">
                    <span className="font-bold bg-blue-500 text-black px-3 py-1 rounded shadow text-sm w-16 text-center">FIXO</span>
                    <span className="flex-grow font-bold text-lg">{p.nama}</span>
                    <span className="font-mono font-bold text-xl bg-white px-3 py-1 rounded border">{fmt(p.rating)}</span>
                  </div>
                ))}

                {/* Ala */}
                {data?.lineup.Ala.map((p, i) => (
                  <div key={"ala-" + i} className="flex items-center gap-4 p-3 bg-green-50 rounded border-l-4 border-green-400 shadow-sm">
                    <span className="font-bold bg-green-500 text-black px-3 py-1 rounded shadow text-sm w-16 text-center">ALA</span>
                    <span className="flex-grow font-bold text-lg">{p.nama}</span>
                    <span className="font-mono font-bold text-xl bg-white px-3 py-1 rounded border">{fmt(p.rating)}</span>
                  </div>
                ))}

                {/* Pivot */}
                {data?.lineup.Pivot.map((p, i) => (
                  <div key={"pivot-" + i} className="flex items-center gap-4 p-3 bg-red-50 rounded border-l-4 border-red-400 shadow-sm">
                    <span className="font-bold bg-red-500 text-black px-3 py-1 rounded shadow text-sm w-16 text-center">PIVOT</span>
                    <span className="flex-grow font-bold text-lg">{p.nama}</span>
                    <span className="font-mono font-bold text-xl bg-white px-3 py-1 rounded border">{fmt(p.rating)}</span>
                  </div>
                ))}

                {(!data?.lineup.GK.length && !data?.lineup.Fixo.length && !data?.lineup.Ala.length && !data?.lineup.Pivot.length) && (
                  <div className="text-center text-gray-500 italic py-8 bg-gray-50 rounded border border-dashed border-gray-300">
                    Tiada data prestasi yang mencukupi untuk menjana cadangan kesebelasan. Sila masukkan penilaian pemain terlebih dahulu.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
    </div>
  );
}
