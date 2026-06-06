import { useState, useEffect } from "react";

interface JadualEvent {
  jadualID: number;
  jenis: string;
  tarikh: string;
  masa: string;
  lokasi: string;
  keterangan: string;
}

interface Kehadiran {
  jadualID: number;
  status: string;
  jenis: string;
  tarikh: string;
}

export function JadualSaya({ setCurrentPage }: any) {
  const [jadualEvents, setJadualEvents] = useState<JadualEvent[]>([]);
  const [kehadiran, setKehadiran] = useState<Kehadiran[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const authHeader = token ? "Bearer " + token : "";
      const [jadualRes, kehadiranRes] = await Promise.all([
        fetch("/api/jadual", {
          headers: { Authorization: authHeader },
        }),
        fetch("/api/kehadiran/pemain/saya", {
          headers: { Authorization: authHeader },
        }),
      ]);

      if (jadualRes.ok) {
        setJadualEvents(await jadualRes.json());
      } else {
        console.error("Gagal mendapatkan data jadual");
      }

      if (kehadiranRes.ok) {
        setKehadiran(await kehadiranRes.json());
      } else {
        console.error("Gagal mendapatkan data kehadiran");
      }
    } catch (error) {
      console.error("Ralat mendapatkan data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ms-MY', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(date).toUpperCase();
  };

  const handlePrint = () => {
    window.print();
  };

  const getStats = () => {
    const monthEvents = kehadiran.filter(k => {
        const eventDate = new Date(k.tarikh);
        return eventDate.getFullYear() === currentDate.getFullYear() && eventDate.getMonth() === currentDate.getMonth();
    });

    const latihanTotal = monthEvents.filter(e => e.jenis === 'Latihan').length;
    const latihanHadir = monthEvents.filter(e => e.jenis === 'Latihan' && e.status === 'Hadir').length;
    const perlawananTotal = monthEvents.filter(e => e.jenis === 'Perlawanan').length;
    const perlawananMain = monthEvents.filter(e => e.jenis === 'Perlawanan' && e.status === 'Hadir').length;

    const latihanPercent = latihanTotal > 0 ? Math.round((latihanHadir / latihanTotal) * 100) : 0;
    const perlawananPercent = perlawananTotal > 0 ? Math.round((perlawananMain / perlawananTotal) * 100) : 0;

    return {
        latihanTotal,
        latihanHadir,
        latihanPercent,
        perlawananTotal,
        perlawananMain,
        perlawananPercent
    };
  };

  const stats = getStats();

  return (
    <div className="bg-white rounded-lg shadow-lg border-4 border-gray-800 max-w-6xl mx-auto">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center rounded-t">
          <h1 className="uppercase">Jadual Saya</h1>
          <button onClick={() => setCurrentPage("player-dashboard")} className="bg-white text-gray-800 px-4 py-2 rounded hover:bg-gray-100 transition-colors">Kembali</button>
        </div>
        <div className="border-t-2 border-gray-800"></div>
        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex justify-between items-center">
            <button onClick={() => changeMonth(-1)} className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors">◀ BULAN LEPAS</button>
            <h2 className="uppercase">BULAN: {new Intl.DateTimeFormat('ms-MY', { month: 'long', year: 'numeric' }).format(currentDate)}</h2>
            <button onClick={() => changeMonth(1)} className="px-4 py-2 bg-gray-200 border-2 border-gray-800 rounded hover:bg-gray-300 transition-colors">BULAN DEPAN ▶</button>
          </div>
          <div className="text-center mt-3">
            <button onClick={() => setCurrentDate(new Date())} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">HARI INI</button>
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <div className="space-y-6">
            {filteredEvents.map((event) => (
              <div key={event.jadualID} className="bg-gray-100 border-2 border-gray-800 rounded p-4">
                <div className="mb-2">📅 {formatEventDate(event.tarikh)}{":"}</div>
                <div className="ml-4 space-y-1">
                  <div>⚽ {event.keterangan} ({event.jenis})</div>
                  <div>🕔 {event.masa} | 📍 {event.lokasi}</div>
                  <button className="mt-2 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">✅ REMINDER</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 border-b-2 border-gray-800">
          <h2 className="uppercase mb-4">📊 Statistik Bulan Ini:</h2>
          <div className="space-y-1">
            <div>• Latihan: {stats.latihanTotal} | Hadir: {stats.latihanHadir} ({stats.latihanPercent}%)</div>
            <div>• Perlawanan: {stats.perlawananTotal} | Main: {stats.perlawananMain} ({stats.perlawananPercent}%)</div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            <button className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">📥 TAMBAH KE KALENDAR</button>
            <button onClick={handlePrint} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors">🖨️ CETAK</button>
          </div>
        </div>
    </div>
  );
}
