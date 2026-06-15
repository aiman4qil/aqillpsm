import { useState, useEffect } from "react";

export function PenilaianPemain({ setCurrentPage, role }: any) {
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [tarikh, setTarikh] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [ratings, setRatings] = useState({
    teknikal: 5,
    fizikal: 5,
    taktikal: 5,
    mental: 5
  });
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getApiCandidates = (path: string) => {
    const envBase = (import.meta as any).env?.VITE_API_BASE as string | undefined;
    const resolvedEnvBase = envBase ? String(envBase).replace(/\/+$/, "") : "";
    const hostname = window.location.hostname;
    const backendHostBase = `${window.location.protocol}//${hostname}:3002`;
    const candidates: string[] = [];
    if (resolvedEnvBase) candidates.push(resolvedEnvBase + path);
    candidates.push(path);
    candidates.push(backendHostBase + path);
    return candidates;
  };

  const fetchJsonApi = async (path: string, init?: RequestInit) => {
    const candidates = getApiCandidates(path);
    let lastError: unknown = null;
    for (const url of candidates) {
      try {
        const res = await fetch(url, init);
        const text = await res.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          data = null;
        }
        if (data === null && res.ok) continue;
        if (res.status === 404 || res.status === 502 || res.status === 503 || res.status === 504) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        return { res, data, text };
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError || new Error("Request failed");
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetchJsonApi("/api/pemain", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resp.res.ok && Array.isArray(resp.data)) {
          const data = resp.data;
          setPlayers(data);
          if (data.length > 0) setSelectedPlayer(String(data[0].pemainID));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchPlayers();
  }, []);

  const handleSave = async () => {
    if (!selectedPlayer) {
      setMessage("Sila pilih pemain.");
      return;
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const resp = await fetchJsonApi("/api/penilaian", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          pemainID: Number(selectedPlayer),
          tarikh: tarikh,
          ...ratings,
          komen: comment
        })
      });
      const data = resp.data;
      if (resp.res.ok) {
        setMessage("Penilaian berjaya disimpan!");
        alert("Penilaian berjaya disimpan!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setComment("");
        setRatings({ teknikal: 5, fizikal: 5, taktikal: 5, mental: 5 });
        setTimeout(() => setMessage(""), 8000);
      } else {
        setMessage(data?.message ? String(data.message) : ("Gagal menyimpan penilaian. (" + resp.res.status + ")"));
      }
    } catch (e) {
      console.error(e);
      setMessage("Ralat sistem.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    if (role === "Pentadbir" || role === "Admin") {
      setCurrentPage("dashboard");
    } else {
      setCurrentPage("coach-dashboard");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-4xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Penilaian Pemain</h1>
          <button onClick={handleBack} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
            Kembali
          </button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        
        {message && (
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 m-4" role="alert">
            <p>{message}</p>
          </div>
        )}

        <div className="p-6 border-b-2 border-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-bold">Pilih Pemain:</label>
              <select 
                value={selectedPlayer} 
                onChange={(e) => setSelectedPlayer(e.target.value)} 
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                {players.map(p => (
                  <option key={p.pemainID} value={p.pemainID}>{p.nama} ({p.posisi})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-bold">Tarikh:</label>
              <input
                type="date"
                value={tarikh}
                onChange={(e) => setTarikh(e.target.value)}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4 font-bold">Skor Penilaian (1-10):</h2>
          <div className="space-y-6">
            {(Object.keys(ratings) as Array<keyof typeof ratings>).map((key) => (
              <div key={key}>
                <div className="flex justify-between mb-2 font-semibold">
                  <span>• {key.charAt(0).toUpperCase() + key.slice(1)}{":"}</span>
                  <span>{ratings[key]}{"/10"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-6 bg-gray-300 rounded overflow-hidden border border-gray-400">
                    <div className="h-full bg-gray-800 transition-all" style={{ width: (ratings[key] / 10) * 100 + "%" }}></div>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={ratings[key]} 
                  onChange={(e) => setRatings({ ...ratings, [key]: Number(e.target.value) })} 
                  className="w-full mt-2 accent-gray-800" 
                />
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4 font-bold">Komen:</h2>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)} 
            placeholder="Masukkan ulasan atau komen..."
            className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[120px]" 
          />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleSave} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase font-bold shadow-lg">
              {isSaving ? "Menyimpan..." : "Simpan Penilaian"}
            </button>
            <button onClick={handleBack} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors uppercase font-bold shadow-lg">
              Batal
            </button>
          </div>
        </div>
    </div>
  );
}
