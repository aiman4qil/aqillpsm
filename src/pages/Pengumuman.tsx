import { useState, useEffect } from "react";

interface Pengumuman {
  pengumumanID: number;
  kepada: string;
  hantar: string;
  tajuk: string;
  kandungan: string;
  tarikh_dibuat: string;
}

export function Pengumuman({ setCurrentPage }: any) {
  const [announcements, setAnnouncements] = useState<Pengumuman[]>([]);
  const [newAnnouncementForm, setNewAnnouncementForm] = useState({
    kepada: "Semua Pemain",
    hantar: "Admin",
    tajuk: "",
    kandungan: "",
  });

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
    const fetchPengumuman = async () => {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const resp = await fetchJsonApi("/api/pengumuman", {
          headers: { Authorization: authHeader },
        });
        if (resp.res.ok && Array.isArray(resp.data)) {
          setAnnouncements(resp.data);
        } else {
          console.error("Gagal memuatkan data pengumuman");
        }
      } catch (error) {
        console.error("Ralat memuatkan data pengumuman:", error);
      }
    };
    fetchPengumuman();
  }, []);

  const handleHantarPengumuman = async () => {
    if (!newAnnouncementForm.tajuk || !newAnnouncementForm.kandungan) {
      alert("Sila isi tajuk dan kandungan pengumuman.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const response = await fetchJsonApi("/api/pengumuman", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(newAnnouncementForm),
      });
      if (response.res.ok) {
        const createdPengumuman = response.data;
        setAnnouncements([createdPengumuman, ...announcements]);
        setNewAnnouncementForm({
          kepada: "Semua Pemain",
          hantar: "Admin",
          tajuk: "",
          kandungan: "",
        });
        alert("Pengumuman berjaya dihantar!");
      } else {
        const msg = response.data?.message ? String(response.data.message) : ("Gagal menghantar pengumuman. (" + response.res.status + ")");
        alert(msg);
      }
    } catch (error) {
      console.error("Ralat menghantar pengumuman:", error);
      alert("Ralat menghantar pengumuman.");
    }
  };

  const handleReset = () => {
    setNewAnnouncementForm({
      kepada: "Semua Pemain",
      hantar: "Admin",
      tajuk: "",
      kandungan: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Pengumuman</h1>
          <button onClick={() => setCurrentPage("dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
            Kembali
          </button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Senarai Pengumuman</h2>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div key={announcement.pengumumanID} className="bg-gray-100 border-2 border-gray-800 rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="uppercase">{announcement.tajuk}</h3>
                  <span className="text-sm text-gray-600">{new Date(announcement.tarikh_dibuat).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">Daripada: {announcement.hantar} | Kepada: {announcement.kepada}</div>
                <div className="border-t border-gray-400 pt-2 mt-2">{announcement.kandungan}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Cipta Pengumuman Baharu</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2">Kepada:</label>
                <select
                  value={newAnnouncementForm.kepada}
                  onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, kepada: e.target.value})}
                  className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                >
                  <option>Semua Pemain</option>
                  <option>Pemain Utama</option>
                  <option>Pemain Simpanan</option>
                  <option>Jurulatih</option>
                </select>
              </div>
              <div>
                <label className="block mb-2">Hantar Sebagai:</label>
                <select
                  value={newAnnouncementForm.hantar}
                  onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, hantar: e.target.value})}
                  className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                >
                  <option>Admin</option>
                  <option>Jurulatih</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block mb-2">Tajuk:</label>
              <input
                type="text"
                value={newAnnouncementForm.tajuk}
                onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, tajuk: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                placeholder="Masukkan tajuk pengumuman"
              />
            </div>
            <div>
              <label className="block mb-2">Kandungan:</label>
              <textarea
                value={newAnnouncementForm.kandungan}
                onChange={(e) => setNewAnnouncementForm({...newAnnouncementForm, kandungan: e.target.value})}
                className="w-full px-4 py-3 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500 min-h-[120px]"
                placeholder="Tulis pengumuman anda di sini..."
              />
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button onClick={handleHantarPengumuman} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Hantar Pengumuman
            </button>
            <button onClick={handleReset} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">Reset</button>
          </div>
        </div>
    </div>
  );
}
