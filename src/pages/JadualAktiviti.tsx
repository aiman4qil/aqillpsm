import { useState, useEffect } from "react";

interface JadualEvent {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
  keterangan: string;
}

interface JadualAktivitiProps {
  setCurrentPage: (page: string) => void;
  role?: string;
}

export function JadualAktiviti({ setCurrentPage, role }: JadualAktivitiProps) {
  const [jadualEvents, setJadualEvents] = useState<JadualEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newEventForm, setNewEventForm] = useState({
    jenis: "Latihan",
    tarikh: "",
    masa: "",
    lokasi: "",
    keterangan: "",
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

  const fetchJadual = async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const resp = await fetchJsonApi("/api/jadual", { headers: { Authorization: authHeader } });
      if (resp.res.ok && Array.isArray(resp.data)) {
        setJadualEvents(resp.data);
      } else {
        console.error("Gagal mendapatkan data jadual");
      }
    } catch (error) {
      console.error("Ralat mendapatkan data jadual:", error);
    }
  };

  useEffect(() => {
    fetchJadual();
  }, []);

  const handleAddEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const resp = await fetchJsonApi("/api/jadual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(newEventForm),
      });
      if (resp.res.ok) {
        alert("Acara berjaya ditambah!");
        fetchJadual(); // Refresh list
        setNewEventForm({ // Reset form
          jenis: "Latihan",
          tarikh: "",
          masa: "",
          lokasi: "",
          keterangan: "",
        });
      } else {
        const msg = resp.data?.message ? String(resp.data.message) : ("Gagal menambah acara. (" + resp.res.status + ")");
        alert(`Gagal menambah acara: ${msg}`);
      }
    } catch (error) {
      console.error("Ralat menambah acara:", error);
      alert("Gagal menambah acara. Sila cuba lagi.");
    }
  };
  
  const handleDeleteEvent = async (id: number) => {
    if (window.confirm("Adakah anda pasti mahu memadam acara ini?")) {
      try {
        const token = localStorage.getItem("token");
        const authHeader = token ? "Bearer " + token : "";
        const resp = await fetchJsonApi(`/api/jadual/${id}`, {
          method: "DELETE",
          headers: { Authorization: authHeader },
        });
        if (resp.res.ok) {
          alert("Acara berjaya dipadam!");
          fetchJadual(); // Refresh list
        } else {
          const msg = resp.data?.message ? String(resp.data.message) : ("Gagal memadam acara. (" + resp.res.status + ")");
          alert(msg);
        }
      } catch (error) {
        console.error("Ralat memadam acara:", error);
        alert("Gagal memadam acara. Sila cuba lagi.");
      }
    }
  };

  const changeMonth = (amount: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + amount);
      return newDate;
    });
  };

  const filteredEvents = jadualEvents.filter(event => {
    const eventDate = new Date(event.tarikh);
    return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ms-MY', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const formatDay = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ms-MY', { weekday: 'long' }).format(date);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const headers = ["Hari", "Tarikh", "Aktiviti", "Masa", "Lokasi"];
    const csvContent = [
      headers.join(","),
      ...filteredEvents.map(e => [
        formatDay(e.tarikh),
        formatDate(e.tarikh),
        e.keterangan,
        e.masa,
        e.lokasi
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `jadual_${currentDate.getFullYear()}_${currentDate.getMonth() + 1}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const backTarget =
    role === "Jurulatih" ? "coach-dashboard" : role === "Pemain" ? "player-dashboard" : "dashboard";

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Jadual Aktiviti</h1>
          <button
            onClick={() => setCurrentPage(backTarget)}
            className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          >
            Kembali
          </button>
        </div>

        <div className="border-t-2 border-gray-800"></div>

        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              ←
            </button>
            <h2 className="uppercase">{new Intl.DateTimeFormat('ms-MY', { month: 'long', year: 'numeric' }).format(currentDate)}</h2>
            <button 
              onClick={() => changeMonth(1)}
              className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        <div className="p-6 border-b-2 border-gray-800 overflow-x-auto">
          <table className="w-full border-2 border-gray-800">
            <thead>
              <tr className="bg-gray-200 border-b-2 border-gray-800">
                <th className="border-r-2 border-gray-800 p-3 text-left">Hari</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Tarikh</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Aktiviti</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Masa</th>
                <th className="border-r-2 border-gray-800 p-3 text-left">Lokasi</th>
                <th className="border-gray-800 p-3 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.jadualID} className="border-b-2 border-gray-800">
                  <td className="border-r-2 border-gray-800 p-3">{formatDay(event.tarikh)}</td>
                  <td className="border-r-2 border-gray-800 p-3">{formatDate(event.tarikh)}</td>
                  <td className="border-r-2 border-gray-800 p-3">{event.keterangan}</td>
                  <td className="border-r-2 border-gray-800 p-3">{event.masa}</td>
                  <td className="border-r-2 border-gray-800 p-3">{event.lokasi}</td>
                  <td className="border-gray-800 p-3 text-center">
                    <button 
                      onClick={() => handleDeleteEvent(event.jadualID)}
                      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-xs"
                    >
                      Padam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">Tambah Acara Baharu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Jenis:</label>
              <select
                value={newEventForm.jenis}
                onChange={(e) => setNewEventForm({...newEventForm, jenis: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                <option>Latihan</option>
                <option>Perlawanan</option>
                <option>Mesyuarat</option>
                <option>Lain-lain</option>
              </select>
            </div>
            <div>
              <label className="block mb-2">Keterangan:</label>
              <input
                type="text"
                value={newEventForm.keterangan}
                onChange={(e) => setNewEventForm({...newEventForm, keterangan: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                placeholder="Contoh: Latihan Taktikal"
              />
            </div>
            <div>
              <label className="block mb-2">Tarikh:</label>
              <input
                type="date"
                value={newEventForm.tarikh}
                onChange={(e) => setNewEventForm({...newEventForm, tarikh: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block mb-2">Masa:</label>
              <input
                type="time"
                value={newEventForm.masa}
                onChange={(e) => setNewEventForm({...newEventForm, masa: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2">Lokasi:</label>
              <input
                type="text"
                value={newEventForm.lokasi}
                onChange={(e) => setNewEventForm({...newEventForm, lokasi: e.target.value})}
                className="w-full px-4 py-2 bg-[#F5F5F5] border-2 border-gray-300 rounded focus:outline-none focus:border-gray-500"
                placeholder="Contoh: Stadium UTHM"
              />
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={handleAddEvent}
              className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase"
            >
              Tambah Acara
            </button>
            <button onClick={handlePrint} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Cetak Jadual
            </button>
            <button onClick={handleExport} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors uppercase">
              Eksport
            </button>
          </div>
        </div>
    </div>
  );
}
