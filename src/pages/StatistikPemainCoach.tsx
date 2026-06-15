import { apiFetch } from "../utils/api";
import { useState, useEffect } from "react";

interface Player {
  pemainID: number;
  nama: string;
}

interface Stats {
  matches: number;
  goals: number;
  assists: number;
  yellow: number;
  red: number;
  rating: number;
}

export function StatistikPemainCoach({ setCurrentPage }: any) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const res = await apiFetch("/api/pemain", {
           headers: { Authorization: authHeader }
        });
        if (res.ok) {
           const data = await res.json();
           setPlayers(data);
        }
      } catch (e) {
         console.error(e);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) {
        setStats(null);
        return;
    }
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const authHeader = token ? "Bearer " + token : "";
            const res = await apiFetch(`/api/prestasi/pemain/${selectedPlayerId}`, {
                headers: { Authorization: authHeader }
            });
            if (res.ok) {
                const data = await res.json();
                // Calculate stats from performance records
                const matches = data.length;
                const goals = data.reduce((acc: number, curr: any) => acc + (curr.gol || 0), 0);
                const assists = data.reduce((acc: number, curr: any) => acc + (curr.assist || 0), 0);
                const yellow = data.reduce((acc: number, curr: any) => acc + (curr.kad_kuning || 0), 0);
                const red = data.reduce((acc: number, curr: any) => acc + (curr.kad_merah || 0), 0);
                const totalRating = data.reduce((acc: number, curr: any) => acc + Number(curr.skor_perlawanan || 0), 0);
                const rating = matches > 0 ? totalRating / matches : 0;

                setStats({ matches, goals, assists, yellow, red, rating });
            }
        } catch (e) {
            console.error(e);
        }
    };
    fetchStats();
  }, [selectedPlayerId]);

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Statistik Pemain</h1>
          <button onClick={() => setCurrentPage("coach-dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">Kembali</button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1">
              <label className="block mb-2">Pilih Pemain:</label>
              <select 
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
              >
                <option value="">-- Sila Pilih Pemain --</option>
                {players.map((p) => (
                    <option key={p.pemainID} value={p.pemainID}>{p.nama}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block mb-2">Tempoh:</label>
              <select className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500">
                <option>Semua Musim</option>
              </select>
            </div>
          </div>
        </div>

        {stats ? (
            <>
                <div className="p-6 border-b-2 border-gray-800">
                <h2 className="uppercase mb-4">📊 Statistik Perlawanan:</h2>
                <div className="space-y-1">
                    <div>• Perlawanan: {stats.matches}</div>
                    <div>• Gol: {stats.goals} ({stats.matches > 0 ? (stats.goals / stats.matches).toFixed(1) : 0}{"/game"})</div>
                    <div>• Assist: {stats.assists} ({stats.matches > 0 ? (stats.assists / stats.matches).toFixed(1) : 0}{"/game"})</div>
                    <div>• Kad Kuning: {stats.yellow}</div>
                    <div>• Kad Merah: {stats.red}</div>
                </div>
                </div>
                <div className="p-6 border-b-2 border-gray-800">
                <h2 className="uppercase mb-4">📈 Statistik Latihan:</h2>
                <div className="space-y-1">
                    {/* Placeholder for attendance as endpoint is not ready for specific player view by coach */}
                    <div>• Purata Rating: {stats.rating.toFixed(1)}{"/10"}</div>
                </div>
                </div>
                <div className="p-6 border-b-2 border-gray-800">
                <h2 className="uppercase mb-4">🎯 Analisis Sistem:</h2>
                <div className="space-y-1 text-gray-500 italic">
                    <div>(Data analisis mendalam belum tersedia)</div>
                </div>
                </div>
            </>
        ) : (
            <div className="p-12 text-center text-gray-500">
                {selectedPlayerId ? "Memuatkan data..." : "Sila pilih pemain untuk melihat statistik."}
            </div>
        )}

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
              disabled={!stats}
              onClick={() => setCurrentPage("analisis-prestasi")}
            >
              Graf Prestasi
            </button>
            <button
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
              disabled={!stats}
              onClick={() => window.print()}
            >
              Cetak
            </button>
            <button onClick={() => setCurrentPage("coach-dashboard")} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Kembali</button>
          </div>
        </div>
    </div>
  );
}
