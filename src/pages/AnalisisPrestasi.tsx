import { useState, useEffect } from "react";

interface Pemain {
  pemainID: number;
  nama: string;
}

interface Jadual {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
}

interface Prestasi {
  prestasiID: number;
  tarikh: string;
  gol: number;
  assist: number;
  kad_kuning: number;
  kad_merah: number;
  skor_perlawanan: number;
}

export function AnalisisPrestasi({ setCurrentPage, role }: any) {
  const [pemainList, setPemainList] = useState<Pemain[]>([]);
  const [jadualList, setJadualList] = useState<Jadual[]>([]);
  const [selectedPemainId, setSelectedPemainId] = useState<number | null>(null);
  const [selectedJadualId, setSelectedJadualId] = useState<number | null>(null);
  const [prestasiData, setPrestasiData] = useState<Prestasi[]>([]);
  const [newPrestasiForm, setNewPrestasiForm] = useState({
    tarikh: "",
    gol: 0,
    assist: 0,
    kad_kuning: 0,
    kad_merah: 0,
    skor_perlawanan: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        
        const [pemainRes, jadualRes] = await Promise.all([
          fetch("/api/pemain", { headers: { Authorization: authHeader } }),
          fetch("/api/jadual", { headers: { Authorization: authHeader } })
        ]);

        if (pemainRes.ok) {
          const data = await pemainRes.json();
          setPemainList(data);
          if (data.length > 0) {
            setSelectedPemainId(data[0].pemainID);
          }
        }

        if (jadualRes.ok) {
          const data = await jadualRes.json();
          setJadualList(data);
        }
      } catch (error) {
        console.error("Ralat memuatkan data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPemainId) {
      const fetchPrestasi = async () => {
        try {
          const token = localStorage.getItem("token");
          const authHeader = token ? "Bearer " + token : "";
          const response = await fetch(`/api/prestasi/pemain/${selectedPemainId}`, {
            headers: { Authorization: authHeader },
          });
          if (response.ok) {
            setPrestasiData(await response.json());
          } else {
            setPrestasiData([]);
          }
        } catch (error) {
          console.error("Ralat memuatkan data prestasi:", error);
          setPrestasiData([]);
        }
      };
      fetchPrestasi();
    }
  }, [selectedPemainId]);

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

  const handleJadualChange = (jadualId: number) => {
    setSelectedJadualId(jadualId);
    const jadual = jadualList.find(j => j.jadualID === jadualId);
    if (jadual) {
      setNewPrestasiForm(prev => ({ ...prev, tarikh: toDateOnly(jadual.tarikh) }));
    }
  };

  const handleInputChange = (field: string, value: number) => {
    let clampedValue = value;
    
    if (field === "gol" && value > 20) clampedValue = 20;
    if (field === "gol" && value < 0) clampedValue = 0;
    
    if (field === "assist" && value > 10) clampedValue = 10;
    if (field === "assist" && value < 0) clampedValue = 0;
    
    if (field === "kad_kuning" && value > 2) clampedValue = 2;
    if (field === "kad_kuning" && value < 0) clampedValue = 0;
    
    if (field === "kad_merah" && value > 1) clampedValue = 1;
    if (field === "kad_merah" && value < 0) clampedValue = 0;
    
    if (field === "skor_perlawanan" && value > 10) clampedValue = 10;
    if (field === "skor_perlawanan" && value < 1) clampedValue = 1;
    
    setNewPrestasiForm(prev => ({ ...prev, [field]: clampedValue }));
  };

  const handleAddPrestasi = async () => {
    if (!selectedPemainId) {
      alert("Sila pilih pemain terlebih dahulu.");
      return;
    }
    if (!newPrestasiForm.tarikh) {
      alert("Sila pilih acara atau tarikh.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const response = await fetch("/api/prestasi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          pemainID: selectedPemainId,
          ...newPrestasiForm,
          tarikh: toDateOnly(newPrestasiForm.tarikh)
        }),
      });
      if (response.ok) {
        alert("Data prestasi berjaya ditambah!");
        const fetchPrestasi = async () => {
            try {
              const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
              const response = await fetch(`/api/prestasi/pemain/${selectedPemainId}`, {
        headers: { Authorization: authHeader }
              });
              if (response.ok) {
                setPrestasiData(await response.json());
              } else {
                setPrestasiData([]);
              }
            } catch (error) {
              console.error("Ralat memuatkan data prestasi:", error);
              setPrestasiData([]);
            }
          };
        fetchPrestasi();
        setNewPrestasiForm({
            tarikh: "",
            gol: 0,
            assist: 0,
            kad_kuning: 0,
            kad_merah: 0,
            skor_perlawanan: 0,
        });
        setSelectedJadualId(null);
      } else {
        alert("Gagal menambah data prestasi.");
      }
    } catch (error) {
      console.error("Ralat menambah prestasi:", error);
    }
  };

  const selectedPemain = pemainList.find(p => p.pemainID === selectedPemainId);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    if (!selectedPemainId) {
      alert("Sila pilih pemain terlebih dahulu.");
      return;
    }
    if (!prestasiData || prestasiData.length === 0) {
      alert("Tiada rekod prestasi untuk dijana laporan.");
      return;
    }

    const playerName = (selectedPemain && selectedPemain.nama) ? selectedPemain.nama : `pemain_${selectedPemainId}`;
    const safeName = playerName.replace(/[\\/:*?"<>|]+/g, "_");

    const headers = ["Tarikh", "Gol", "Assist", "Kad Kuning", "Kad Merah", "Skor"];
    const lines = [headers.join(",")];
    for (const p of prestasiData) {
      lines.push([
        toDateOnly(p.tarikh),
        String(p.gol ?? 0),
        String(p.assist ?? 0),
        String(p.kad_kuning ?? 0),
        String(p.kad_merah ?? 0),
        String(p.skor_perlawanan ?? "")
      ].join(","));
    }

    const csv = "\uFEFF" + lines.join("\n");
    downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8" }), `laporan_prestasi_${safeName}.csv`);
  };

  const handleExport = () => {
    if (!selectedPemainId) {
      alert("Sila pilih pemain terlebih dahulu.");
      return;
    }
    if (!prestasiData || prestasiData.length === 0) {
      alert("Tiada rekod prestasi untuk dieksport.");
      return;
    }
    const playerName = (selectedPemain && selectedPemain.nama) ? selectedPemain.nama : `pemain_${selectedPemainId}`;
    const safeName = playerName.replace(/[\\/:*?"<>|]+/g, "_");
    const payload = {
      pemainID: selectedPemainId,
      nama: selectedPemain ? selectedPemain.nama : null,
      exportAt: new Date().toISOString(),
      prestasi: prestasiData
    };
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `prestasi_${safeName}.json`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto" id="print-area">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Analisis Prestasi Pemain</h1>
          <button onClick={() => setCurrentPage(role === "Jurulatih" ? "coach-dashboard" : "dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
            Kembali
          </button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        <div className="p-6 border-b-2 border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold mb-2">Pilih Pemain:</label>
              <select
                value={selectedPemainId ?? ""}
                onChange={(e) => setSelectedPemainId(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-800 rounded"
              >
                {pemainList.map(pemain => (
                  <option key={pemain.pemainID} value={pemain.pemainID}>
                    {pemain.nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold mb-2">Pilih Acara (Jadual):</label>
              <select
                value={selectedJadualId ?? ""}
                onChange={(e) => handleJadualChange(Number(e.target.value))}
                className="w-full p-3 border-2 border-gray-800 rounded"
              >
                <option value="">Pilih acara...</option>
                {jadualList.map(jadual => (
                  <option key={jadual.jadualID} value={jadual.jadualID}>
                    {jadual.jenis} - {new Date(jadual.tarikh).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
          <h2 className="uppercase mb-4">Rekod Prestasi</h2>
          <table className="w-full border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-800">
                <th className="p-3 text-left">Tarikh</th>
                <th className="p-3 text-left">Gol</th>
                <th className="p-3 text-left">Assist</th>
                <th className="p-3 text-left">Kad Kuning</th>
                <th className="p-3 text-left">Kad Merah</th>
                <th className="p-3 text-left">Skor</th>
              </tr>
            </thead>
            <tbody>
              {prestasiData.map((p) => (
                <tr key={p.prestasiID} className="border-b-2 border-gray-800">
                  <td className="p-3">{new Date(p.tarikh).toLocaleDateString()}</td>
                  <td className="p-3">{p.gol}</td>
                  <td className="p-3">{p.assist}</td>
                  <td className="p-3">{p.kad_kuning}</td>
                  <td className="p-3">{p.kad_merah}</td>
                  <td className="p-3">{p.skor_perlawanan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Tambah Rekod Prestasi</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold mb-1">Tarikh</label>
              <input type="date" value={newPrestasiForm.tarikh} onChange={e => setNewPrestasiForm({...newPrestasiForm, tarikh: e.target.value})} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
            <div>
              <label className="block font-bold mb-1">Gol (max 20)</label>
              <input type="number" min="0" max="20" placeholder="Gol" value={newPrestasiForm.gol} onChange={e => handleInputChange("gol", Number(e.target.value))} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
            <div>
              <label className="block font-bold mb-1">Assist (max 10)</label>
              <input type="number" min="0" max="10" placeholder="Assist" value={newPrestasiForm.assist} onChange={e => handleInputChange("assist", Number(e.target.value))} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
            <div>
              <label className="block font-bold mb-1">Kad Kuning (max 2)</label>
              <input type="number" min="0" max="2" placeholder="Kad Kuning" value={newPrestasiForm.kad_kuning} onChange={e => handleInputChange("kad_kuning", Number(e.target.value))} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
            <div>
              <label className="block font-bold mb-1">Kad Merah (max 1)</label>
              <input type="number" min="0" max="1" placeholder="Kad Merah" value={newPrestasiForm.kad_merah} onChange={e => handleInputChange("kad_merah", Number(e.target.value))} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
            <div>
              <label className="block font-bold mb-1">Skor (1-10)</label>
              <input type="number" step="0.1" min="1" max="10" placeholder="Skor" value={newPrestasiForm.skor_perlawanan} onChange={e => handleInputChange("skor_perlawanan", Number(e.target.value))} className="w-full p-2 border-2 border-gray-400 rounded" />
            </div>
          </div>
          <button onClick={handleAddPrestasi} className="mt-4 px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Tambah Rekod</button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleGenerateReport} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Jana Laporan</button>
            <button onClick={handlePrint} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Cetak</button>
            <button onClick={handleExport} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Eksport</button>
          </div>
        </div>
    </div>
  );
}
