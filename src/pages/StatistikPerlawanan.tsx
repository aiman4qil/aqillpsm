import { useState, useEffect } from "react";

interface MatchPlayer {
  id: number;
  nama: string;
  gol: number;
  assist: number;
  kad_kuning: number;
  kad_merah: number;
  skor_perlawanan: number;
}

interface Jadual {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
}

interface StatistikPerlawananProps {
  setCurrentPage: (page: string) => void;
}

export function StatistikPerlawanan({ setCurrentPage }: StatistikPerlawananProps) {
  const [matches, setMatches] = useState<Jadual[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([]);
  const [matchResult, setMatchResult] = useState("Seri");
  const [loading, setLoading] = useState(false);

  // Fetch matches (Jadual)
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const response = await fetch("/api/jadual", {
          headers: { Authorization: authHeader },
        });
        if (response.ok) {
          const data: Jadual[] = await response.json();
          // Don't filter, show all jadual
          setMatches(data);
          if (data.length > 0) {
            setSelectedMatchId(data[0].jadualID);
          }
        }
      } catch (error) {
        console.error("Ralat memuatkan jadual:", error);
      }
    };
    fetchMatches();
  }, []);

  // Fetch stats based on selected match date
  useEffect(() => {
    if (!selectedMatchId) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const selectedMatch = matches.find(m => m.jadualID === selectedMatchId);
        if (!selectedMatch) return;

        const toDateOnly = (value: string) => {
          const raw = String(value || "").trim();
          if (!raw) return "";
          if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
          if (raw.includes("T")) {
            const d = new Date(raw);
            if (Number.isNaN(d.getTime())) return "";
            const yyyy = String(d.getFullYear());
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}`;
          }
          const head = raw.slice(0, 10);
          if (/^\d{4}-\d{2}-\d{2}$/.test(head)) return head;
          const d = new Date(raw);
          if (Number.isNaN(d.getTime())) return "";
          const yyyy = String(d.getFullYear());
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${yyyy}-${mm}-${dd}`;
        };

        const matchDate = toDateOnly(selectedMatch.tarikh);
        if (!matchDate) {
          setMatchPlayers([]);
          return;
        }

        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        
        // Fetch all players first to map names
        const playersResponse = await fetch("/api/pemain", {
            headers: { Authorization: authHeader },
        });
        const playersData = await playersResponse.json();

        // Fetch performance records for each player (inefficient but works for now given API constraints)
        // Ideally we need an endpoint /api/prestasi/date/:date
        // For now, we will simulate by fetching all per player or we need a new endpoint.
        // Let's rely on a new endpoint logic or client-side filtering if dataset is small.
        // Actually, fetching per player is too slow.
        // Let's fetch all players, then for each player, fetch their stats? No.
        
        // Let's fetch all stats for all players? No endpoint for that.
        // I will create a new endpoint in backend to fetch stats by date.
        // For now, I'll fetch players, and render them with 0 stats if no data found?
        // Wait, user wants "Alive" system.
        
        // Strategy:
        // 1. Get all players.
        // 2. For each player, try to find a performance record on that date.
        // This requires multiple API calls or a better API.
        // Let's assume I can add an API endpoint: GET /api/prestasi/tarikh/:date
        
        const response = await fetch(`/api/prestasi/tarikh/${matchDate}`, {
             headers: { Authorization: authHeader },
        });
        
        if (response.ok) {
            const stats = await response.json();
            // Map stats to display format
            // We need player name. The endpoint should return it joined.
            setMatchPlayers(stats.map((s: any) => ({
                id: Number(s.statistik_id ?? s.statistikID ?? s.prestasiID ?? 0),
                nama: s.nama_pemain || s.username || "Unknown",
                gol: s.gol,
                assist: s.assist,
                kad_kuning: s.kad_kuning,
                kad_merah: s.kad_merah,
                skor_perlawanan: s.skor_perlawanan
            })));
        } else {
            setMatchPlayers([]);
        }

      } catch (error) {
        console.error("Error fetching match stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedMatchId, matches]);

  const selectedMatch = matches.find(m => m.jadualID === selectedMatchId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto" id="print-area">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Rekod Statistik Perlawanan</h1>
          <button
            onClick={() => setCurrentPage("coach-dashboard")}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="space-y-4">
            <div>
                <label className="block font-bold mb-2">Pilih Perlawanan:</label>
                <select 
                    className="w-full p-2 border-2 border-gray-800 rounded"
                    value={selectedMatchId || ""}
                    onChange={(e) => setSelectedMatchId(Number(e.target.value))}
                >
                    {matches.map(m => (
                        <option key={m.jadualID} value={m.jadualID}>
                            {m.jenis} ({new Date(m.tarikh).toLocaleDateString()} {m.masa})
                        </option>
                    ))}
                    {matches.length === 0 && <option>Tiada perlawanan direkodkan</option>}
                </select>
            </div>
            
            {selectedMatch && (
                <div className="bg-gray-100 p-4 rounded border border-gray-400">
                    <div><strong>Perlawanan:</strong> {selectedMatch.jenis}</div>
                    <div><strong>Tarikh:</strong> {new Date(selectedMatch.tarikh).toLocaleDateString()} &nbsp;&nbsp; <strong>Masa:</strong> {selectedMatch.masa}</div>
                    <div><strong>Lokasi:</strong> {selectedMatch.lokasi}</div>
                </div>
            )}
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
          {loading ? (
              <div className="text-center p-4">Memuatkan statistik...</div>
          ) : matchPlayers.length > 0 ? (
            <table className="w-full border-2 border-gray-800">
                <thead>
                <tr className="bg-gray-200 border-b-2 border-gray-800">
                    <th className="border-r-2 border-gray-800 p-3 text-left">No.</th>
                    <th className="border-r-2 border-gray-800 p-3 text-left">Nama Pemain</th>
                    <th className="border-r-2 border-gray-800 p-3 text-center">Gol</th>
                    <th className="border-r-2 border-gray-800 p-3 text-center">Assist</th>
                    <th className="border-r-2 border-gray-800 p-3 text-center">Kuning</th>
                    <th className="border-gray-800 p-3 text-center">Merah</th>
                </tr>
                </thead>
                <tbody>
                {matchPlayers.map((player, index) => (
                    <tr key={player.id} className="border-b-2 border-gray-800">
                    <td className="border-r-2 border-gray-800 p-3">{index + 1}{". "}</td>
                    <td className="border-r-2 border-gray-800 p-3">{player.nama}</td>
                    <td className="border-r-2 border-gray-800 p-3 text-center">{player.gol}</td>
                    <td className="border-r-2 border-gray-800 p-3 text-center">{player.assist}</td>
                    <td className="border-r-2 border-gray-800 p-3 text-center">{player.kad_kuning}</td>
                    <td className="border-gray-800 p-3 text-center">{player.kad_merah}</td>
                    </tr>
                ))}
                </tbody>
            </table>
          ) : (
              <div className="text-center p-4 text-gray-500">Tiada rekod prestasi dijumpai untuk tarikh ini. Sila masukkan data prestasi di menu Analisis Prestasi.</div>
          )}
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="mb-3">Keputusan (Manual):</div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="Menang"
                checked={matchResult === "Menang"}
                onChange={(e) => setMatchResult(e.target.value)}
                className="w-5 h-5"
              />
              <span>Menang</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="Kalah"
                checked={matchResult === "Kalah"}
                onChange={(e) => setMatchResult(e.target.value)}
                className="w-5 h-5"
              />
              <span>Kalah</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="result"
                value="Seri"
                checked={matchResult === "Seri"}
                onChange={(e) => setMatchResult(e.target.value)}
                className="w-5 h-5"
              />
              <span>Seri</span>
            </label>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={handlePrint} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Cetak
            </button>
          </div>
        </div>
    </div>
  );
}
